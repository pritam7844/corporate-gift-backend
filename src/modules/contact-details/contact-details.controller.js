import { Redis } from '@upstash/redis';
import * as xlsx from 'xlsx';
import ContactDetail from './contact-details.model.js';
import Company from '../company/company.model.js';

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const REDIS_QUEUE_KEY = 'contact_form_submissions';

export const submitContactForm = async (req, res) => {
  try {
    const { 
      companySlug, firstName, middleName, lastName, 
      mobileNumber, email, employeeId, employeeBranch, 
      streetAddress, addressLine2, city, state, country, 
      zipCode, landmark 
    } = req.body;

    // Validate required fields
    if (!companySlug || !firstName || !lastName || !mobileNumber || !employeeId || !streetAddress || !city || !state || !country || !zipCode) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Prepare data payload for Redis
    const payload = {
      companySlug,
      firstName,
      middleName: middleName || '',
      lastName,
      mobileNumber,
      email: email || '',
      employeeId,
      employeeBranch: employeeBranch || '',
      streetAddress,
      addressLine2: addressLine2 || '',
      city,
      state,
      country,
      zipCode,
      landmark: landmark || '',
      timestamp: new Date().toISOString()
    };

    // Push to Redis List (Incredibly fast, easily handles 1000s of requests per sec)
    await redis.lpush(REDIS_QUEUE_KEY, JSON.stringify(payload));

    // Return immediate success response to user
    res.status(202).json({
      success: true,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    console.error('Submit form error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const processCronQueue = async (req, res) => {
  try {
    // 1. Verify cron secret to prevent unauthorized hits
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 2. Fetch all current items from the Redis list
    // lrange 0 -1 gets all items. 
    const items = await redis.lrange(REDIS_QUEUE_KEY, 0, -1);
    
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: 'Queue is empty' });
    }

    // 3. We will clear the queue in Redis AFTER successful DB insertion
    // to prevent data loss if the database is down.

    // 4. Process the items. We need to map companySlug to companyId.
    const companySlugs = [...new Set(items.map(item => item.companySlug))];
    const companies = await Company.find({ subdomain: { $in: companySlugs } });
    
    const companyMap = {};
    companies.forEach(c => {
      companyMap[c.subdomain] = c._id;
    });

    // 5. Prepare batch for MongoDB
    const batchInsertData = [];
    for (const item of items) {
      const companyId = companyMap[item.companySlug];
      if (companyId) {
        batchInsertData.push({
          companyId,
          firstName: item.firstName,
          middleName: item.middleName,
          lastName: item.lastName,
          mobileNumber: item.mobileNumber,
          email: item.email,
          employeeId: item.employeeId,
          employeeBranch: item.employeeBranch,
          streetAddress: item.streetAddress,
          addressLine2: item.addressLine2,
          city: item.city,
          state: item.state,
          country: item.country,
          zipCode: item.zipCode,
          landmark: item.landmark
        });
      }
    }

    // 6. Bulk Insert into MongoDB
    if (batchInsertData.length > 0) {
      await ContactDetail.insertMany(batchInsertData);
    }

    // 7. Safely clear the processed items from Redis ONLY AFTER successful DB insert
    await redis.ltrim(REDIS_QUEUE_KEY, items.length, -1);

    res.status(200).json({ 
      success: true, 
      message: `Processed ${batchInsertData.length} submissions` 
    });

  } catch (error) {
    console.error('Cron process error:', error);
    res.status(500).json({ success: false, message: 'Cron execution failed' });
  }
};

export const getCompanySubmissions = async (req, res) => {
  try {
    const { companyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const total = await ContactDetail.countDocuments({ companyId });
    const submissions = await ContactDetail.find({ companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Faster query

    res.status(200).json({ 
      success: true, 
      data: submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const exportCompanySubmissions = async (req, res) => {
  try {
    const { companyId } = req.params;
    // Use .lean() for faster execution and less memory on Vercel
    const submissions = await ContactDetail.find({ companyId }).sort({ createdAt: -1 }).populate('companyId', 'name').lean();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const companyName = submissions[0].companyId?.name || 'Company';

    // Generate CSV string
    const headers = [
      'First Name', 'Middle Name', 'Last Name', 'Mobile Number', 'Email', 
      'Employee ID', 'Employee Branch', 'Street Address', 'Address Line 2', 
      'City', 'State/Province', 'Country', 'ZIP/Postal Code', 'Nearby Area/Landmark', 'Submitted At'
    ];
    
    const rows = submissions.map(sub => [
      `"${sub.firstName}"`,
      `"${sub.middleName || ''}"`,
      `"${sub.lastName}"`,
      `"${sub.mobileNumber}"`,
      `"${sub.email || ''}"`,
      `"${sub.employeeId}"`,
      `"${sub.employeeBranch || ''}"`,
      `"${sub.streetAddress}"`,
      `"${sub.addressLine2 || ''}"`,
      `"${sub.city}"`,
      `"${sub.state}"`,
      `"${sub.country}"`,
      `"${sub.zipCode}"`,
      `"${sub.landmark || ''}"`,
      `"${new Date(sub.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${companyName.replace(/\s+/g, '_')}_Submissions.csv"`);
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const exportCompanySubmissionsExcel = async (req, res) => {
  try {
    const { companyId } = req.params;
    // Use .lean() for huge performance boost on Vercel limits
    const submissions = await ContactDetail.find({ companyId }).sort({ createdAt: -1 }).populate('companyId', 'name').lean();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const companyName = submissions[0].companyId?.name || 'Company';

    // Format data for Excel
    const excelData = submissions.map(sub => ({
      'First Name': sub.firstName,
      'Middle Name': sub.middleName || '',
      'Last Name': sub.lastName,
      'Mobile Number': sub.mobileNumber,
      'Email': sub.email || '',
      'Employee ID': sub.employeeId,
      'Employee Branch': sub.employeeBranch || '',
      'Street Address': sub.streetAddress,
      'Address Line 2': sub.addressLine2 || '',
      'City': sub.city,
      'State/Province': sub.state,
      'Country': sub.country,
      'ZIP/Postal Code': sub.zipCode,
      'Nearby Area/Landmark': sub.landmark || '',
      'Submitted At': new Date(sub.createdAt).toLocaleString()
    }));

    // Create workbook and worksheet
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Submissions");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${companyName.replace(/\s+/g, '_')}_Submissions.xlsx"`);
    
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Export excel error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
