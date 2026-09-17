import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/store';
import { RockPayEngine } from './server/engine';
import { HubOrder, ServiceCategory } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API ROUTES (Mounted FIRST)
  // ==========================================

  // Health & Architecture Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'RockPay Core Engine',
      gateways: {
        paymentGateway: 'Paystack Multi-Split API (Subaccounts: Gov, Logistics, RockPay Margin)',
        identityAggregator: 'Dojah / Prembly (Identitypass) [NIMC, FIRS, FRSC/MVAA]',
        insurtech: 'MyCover.ai API (Automated NIID Database Upload)',
        utilitiesAndEducation: 'VTPASS / Shago API (Prepaid Meter Validation & Exam PINs)',
        transactionalEmail: 'Resend / SendGrid Webhook Triggers',
      },
      stats: {
        totalOrders: db.getAllOrders().length,
        dispatchedEmails: db.getEmails().length,
      },
    });
  });

  // Current session user
  app.get('/api/auth/current-user', (req, res) => {
    const user = db.getUserByEmail('peteroche32@gmail.com') || db.upsertUser('peteroche32@gmail.com', 'Peter Oche', '+234 803 456 7890');
    res.json(user);
  });

  // Contact & Project Inquiry Lead Intake
  app.post('/api/contact', (req, res) => {
    try {
      const { fullName, email, phone, service, message } = req.body;
      if (!fullName || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      console.log('New Project Inquiry Received:', { fullName, email, phone, service, message, timestamp: new Date().toISOString() });
      res.json({
        success: true,
        message: 'Inquiry received successfully. Our engineering team will contact you shortly.',
        data: { fullName, email, phone, service, message, receivedAt: new Date().toISOString() }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1. Vehicle Verification (FRSC / MVAA / Dojah / Prembly)
  app.post('/api/lookup/vehicle', (req, res) => {
    try {
      const { plateNumber } = req.body;
      if (!plateNumber) return res.status(400).json({ error: 'Plate number is required' });
      const result = RockPayEngine.lookupVehicle(plateNumber);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. NIN Lookup (NIMC / Dojah)
  app.post('/api/lookup/nin', (req, res) => {
    try {
      const { query, lookupType = 'NIN' } = req.body;
      if (!query) return res.status(400).json({ error: 'NIN or tracking query is required' });
      const result = RockPayEngine.lookupNin(query, lookupType);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. TIN Extraction (FIRS / Joint Tax Board)
  app.post('/api/lookup/tin', (req, res) => {
    try {
      const { queryValue, queryType = 'NIN' } = req.body;
      if (!queryValue) return res.status(400).json({ error: 'Query value is required' });
      const result = RockPayEngine.lookupTin(queryValue, queryType);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. CAC Pricing Calculation
  app.post('/api/lookup/cac-pricing', (req, res) => {
    try {
      const { businessType, plaque = false } = req.body;
      const result = RockPayEngine.calculateCacPricing(businessType, plaque);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Electricity Meter Lookup (VTPASS / Shago API)
  app.post('/api/lookup/meter', (req, res) => {
    try {
      const { disco, meterNumber, meterType = 'PREPAID' } = req.body;
      if (!disco || !meterNumber) return res.status(400).json({ error: 'Disco and meterNumber are required' });
      const result = RockPayEngine.lookupMeter(disco, meterNumber, meterType);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Exam PINs Pricing
  app.post('/api/lookup/exam-pricing', (req, res) => {
    try {
      const { examBody = 'WAEC', quantity = 1 } = req.body;
      const result = RockPayEngine.getExamPricing(examBody, Number(quantity));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create Order in LOOKED_UP status with Paystack Split calculation
  app.post('/api/orders/create', (req, res) => {
    try {
      const { serviceType, rawGovCost, serviceMargin, deliveryFee = 0, isPhysical = false, metaPayload } = req.body;

      const user = db.getUserByEmail('peteroche32@gmail.com') || db.upsertUser('peteroche32@gmail.com', 'Peter Oche');
      const orderId = `ord_${Math.random().toString(36).substring(2, 9)}`;
      const paymentRef = `RP_PSK_${serviceType.slice(0, 3)}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const totalCharged = Number(rawGovCost) + Number(serviceMargin) + Number(deliveryFee);

      const splitConfig = RockPayEngine.calculatePaystackSplit(
        Number(rawGovCost),
        Number(serviceMargin),
        Number(deliveryFee),
        serviceType as ServiceCategory
      );

      const order: HubOrder = {
        id: orderId,
        userId: user.id,
        serviceType,
        status: 'LOOKED_UP',
        paymentRef,
        rawGovCost: Number(rawGovCost),
        serviceMargin: Number(serviceMargin),
        deliveryFee: Number(deliveryFee),
        totalCharged,
        isPhysical: Boolean(isPhysical),
        metaPayload,
        trackingNotes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'LOOKED_UP',
            timestamp: new Date().toISOString(),
            note: 'Intake validated & Paystack Multi-Split payment reference created',
          },
        ],
      };

      db.createOrder(order);

      res.json({
        order,
        splitBreakdown: splitConfig,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Process Checkout (Paystack Split Clearing ➔ Advancing State Machine & Triggering Emails)
  app.post('/api/orders/checkout', async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: 'orderId is required' });

      const updatedOrder = await RockPayEngine.processOrderPayment(orderId);
      const splitBreakdown = RockPayEngine.calculatePaystackSplit(
        updatedOrder.rawGovCost,
        updatedOrder.serviceMargin,
        updatedOrder.deliveryFee,
        updatedOrder.serviceType
      );

      res.json({
        order: updatedOrder,
        splitBreakdown,
        triggeredEmails: db.getEmailsForOrder(orderId),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fetch all orders with optional filter
  app.get('/api/orders', (req, res) => {
    try {
      const { serviceType, status, isPhysical, search } = req.query;
      let orders = db.getAllOrders();

      if (serviceType && serviceType !== 'ALL') {
        orders = orders.filter((o) => o.serviceType === serviceType);
      }
      if (status && status !== 'ALL') {
        orders = orders.filter((o) => o.status === status);
      }
      if (isPhysical !== undefined) {
        const isPhys = isPhysical === 'true';
        orders = orders.filter((o) => o.isPhysical === isPhys);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        orders = orders.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.paymentRef.toLowerCase().includes(q) ||
            JSON.stringify(o.metaPayload).toLowerCase().includes(q)
        );
      }

      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fetch single order details
  app.get('/api/orders/:id', (req, res) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      const splitBreakdown = RockPayEngine.calculatePaystackSplit(
        order.rawGovCost,
        order.serviceMargin,
        order.deliveryFee,
        order.serviceType
      );
      const emails = db.getEmailsForOrder(order.id);
      res.json({ order, splitBreakdown, emails });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Actions
  // Mark as Sealed
  app.post('/api/admin/orders/:id/seal', (req, res) => {
    try {
      const updated = RockPayEngine.markAsSealed(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dispatch Package (Enter Rider Name, Contact No, and Tracking ID/Receipt text)
  app.post('/api/admin/orders/:id/dispatch', (req, res) => {
    try {
      const { trackingNotes } = req.body;
      if (!trackingNotes) {
        return res.status(400).json({ error: 'Dispatch notes with rider details are required' });
      }
      const updated = RockPayEngine.dispatchPackage(req.params.id, trackingNotes);
      res.json({
        order: updated,
        dispatchedEmail: db.getEmailsForOrder(updated.id).find((e) => e.triggerStatus === 'DISPATCHED'),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark as Delivered
  app.post('/api/admin/orders/:id/deliver', (req, res) => {
    try {
      const updated = RockPayEngine.markAsDelivered(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CAC Accredited Agent Sub-status Update
  app.post('/api/admin/orders/:id/cac-update', (req, res) => {
    try {
      const { subStatus, rcNumber, approvedName, notes } = req.body;
      const order = db.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      if (order.serviceType === 'CAC_REGISTRATION') {
        const data = order.metaPayload.data as any;
        if (subStatus) data.subStatus = subStatus;
        if (rcNumber) data.rcNumber = rcNumber;
        if (approvedName) data.approvedName = approvedName;
        if (notes) data.accreditedAgentNotes = notes;

        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
          status: order.status,
          timestamp: new Date().toISOString(),
          note: `CAC agent update: ${subStatus} | RC: ${rcNumber || 'Pending'}`,
        });

        db.updateOrder(order.id, order);
      }

      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get All Transactional Emails
  app.get('/api/emails', (req, res) => {
    try {
      res.json(db.getEmails());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Back-office Admin Operational & Financial Metrics
  app.get('/api/admin/metrics', (req, res) => {
    try {
      const orders = db.getAllOrders();
      const queuedPrint = orders.filter((o) => o.isPhysical && o.status === 'QUEUED_PRINT');
      const sealed = orders.filter((o) => o.isPhysical && o.status === 'SEALED');
      const dispatched = orders.filter((o) => o.isPhysical && o.status === 'DISPATCHED');
      const delivered = orders.filter((o) => o.status === 'DELIVERED');

      let totalGrossRevenue = 0;
      let totalGovPassthrough = 0;
      let totalRockpayMargin = 0;
      let totalLogisticsPool = 0;

      for (const ord of orders) {
        if (ord.status !== 'LOOKED_UP') {
          totalGrossRevenue += ord.totalCharged;
          totalGovPassthrough += ord.rawGovCost;
          totalRockpayMargin += ord.serviceMargin;
          totalLogisticsPool += ord.deliveryFee;
        }
      }

      res.json({
        fulfillmentQueue: {
          queuedPrintCount: queuedPrint.length,
          sealedCount: sealed.length,
          dispatchedCount: dispatched.length,
          deliveredCount: delivered.length,
        },
        financials: {
          totalGrossRevenue,
          totalGovPassthrough,
          totalRockpayMargin,
          totalLogisticsPool,
          currency: 'NGN (₦)',
        },
        serviceDistribution: {
          VEHICLE_RENEWAL: orders.filter((o) => o.serviceType === 'VEHICLE_RENEWAL').length,
          NIN_SERVICES: orders.filter((o) => o.serviceType === 'NIN_SERVICES').length,
          TIN_EXTRACTION: orders.filter((o) => o.serviceType === 'TIN_EXTRACTION').length,
          CAC_REGISTRATION: orders.filter((o) => o.serviceType === 'CAC_REGISTRATION').length,
          ELECTRICITY_UTILITY: orders.filter((o) => o.serviceType === 'ELECTRICITY_UTILITY').length,
          EDUCATION_PINS: orders.filter((o) => o.serviceType === 'EDUCATION_PINS').length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset demo store
  app.post('/api/admin/reset-store', (req, res) => {
    try {
      db.reset();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE (Development) vs STATIC (Production)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RockPay Core Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
