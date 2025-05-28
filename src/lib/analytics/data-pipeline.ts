import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { logger } from '../monitoring/datadog';

export class DataPipelineService {
  private warehousePool: Pool;
  private prisma: PrismaClient;

  constructor() {
    this.warehousePool = new Pool({
      host: process.env.DATA_WAREHOUSE_HOST,
      port: parseInt(process.env.DATA_WAREHOUSE_PORT || '5432'),
      user: process.env.DATA_WAREHOUSE_USER,
      password: process.env.DATA_WAREHOUSE_PASSWORD,
      database: process.env.DATA_WAREHOUSE_DB,
    });
    
    this.prisma = new PrismaClient();
  }

  async syncCustomerData() {
    try {
      logger.info('Starting customer data sync to warehouse');
      const customers = await this.prisma.user.findMany({
        include: {
          profile: true,
          subscriptions: true,
          invoices: true,
        },
      });

      const client = await this.warehousePool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const customer of customers) {
          await client.query(
            `INSERT INTO customers (id, email, name, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET
               email = EXCLUDED.email,
               name = EXCLUDED.name,
               updated_at = EXCLUDED.updated_at`,
            [customer.id, customer.email, customer.profile?.name, customer.createdAt, customer.updatedAt]
          );
          
          // Sync subscription data
          if (customer.subscriptions) {
            for (const subscription of customer.subscriptions) {
              await client.query(
                `INSERT INTO subscriptions (id, customer_id, plan_id, status, created_at, updated_at, current_period_end)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (id) DO UPDATE SET
                   status = EXCLUDED.status,
                   updated_at = EXCLUDED.updated_at,
                   current_period_end = EXCLUDED.current_period_end`,
                [
                  subscription.id,
                  customer.id,
                  subscription.planId,
                  subscription.status,
                  subscription.createdAt,
                  subscription.updatedAt,
                  subscription.currentPeriodEnd
                ]
              );
            }
          }
          
          // Sync invoice data
          if (customer.invoices) {
            for (const invoice of customer.invoices) {
              await client.query(
                `INSERT INTO invoices (id, customer_id, amount, status, created_at, updated_at, due_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (id) DO UPDATE SET
                   status = EXCLUDED.status,
                   updated_at = EXCLUDED.updated_at`,
                [
                  invoice.id,
                  customer.id,
                  invoice.amount,
                  invoice.status,
                  invoice.createdAt,
                  invoice.updatedAt,
                  invoice.dueDate
                ]
              );
            }
          }
        }
        
        await client.query('COMMIT');
        logger.info(`Synced ${customers.length} customers to data warehouse`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error syncing customer data to warehouse', { error });
      throw error;
    }
  }

  async syncInvoiceData() {
    try {
      logger.info('Starting invoice data sync to warehouse');
      const invoices = await this.prisma.invoice.findMany({
        include: {
          items: true,
          payments: true,
          user: true,
        },
      });

      const client = await this.warehousePool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const invoice of invoices) {
          await client.query(
            `INSERT INTO invoices (id, customer_id, amount, status, created_at, updated_at, due_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               status = EXCLUDED.status,
               updated_at = EXCLUDED.updated_at`,
            [
              invoice.id,
              invoice.userId,
              invoice.total,
              invoice.status,
              invoice.createdAt,
              invoice.updatedAt,
              invoice.dueDate
            ]
          );
          
          // Sync invoice items
          if (invoice.items) {
            for (const item of invoice.items) {
              await client.query(
                `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET
                   description = EXCLUDED.description,
                   quantity = EXCLUDED.quantity,
                   unit_price = EXCLUDED.unit_price`,
                [
                  item.id,
                  invoice.id,
                  item.description,
                  item.quantity,
                  item.unitPrice,
                  item.createdAt
                ]
              );
            }
          }
          
          // Sync payment data
          if (invoice.payments) {
            for (const payment of invoice.payments) {
              await client.query(
                `INSERT INTO payments (id, invoice_id, amount, payment_method, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET
                   status = EXCLUDED.status`,
                [
                  payment.id,
                  invoice.id,
                  payment.amount,
                  payment.paymentMethod,
                  payment.status,
                  payment.createdAt
                ]
              );
            }
          }
        }
        
        await client.query('COMMIT');
        logger.info(`Synced ${invoices.length} invoices to data warehouse`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error syncing invoice data to warehouse', { error });
      throw error;
    }
  }

  async syncCarbonOffsetData() {
    try {
      logger.info('Starting carbon offset data sync to warehouse');
      const offsets = await this.prisma.carbonOffset.findMany({
        include: {
          invoice: true,
        },
      });

      const client = await this.warehousePool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const offset of offsets) {
          await client.query(
            `INSERT INTO carbon_offsets (id, invoice_id, amount_kg, cost, provider, created_at, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               status = EXCLUDED.status`,
            [
              offset.id,
              offset.invoiceId,
              offset.amountKg,
              offset.cost,
              offset.provider,
              offset.createdAt,
              offset.status
            ]
          );
        }
        
        await client.query('COMMIT');
        logger.info(`Synced ${offsets.length} carbon offsets to data warehouse`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error syncing carbon offset data to warehouse', { error });
      throw error;
    }
  }

  async runFullSync() {
    try {
      await this.syncCustomerData();
      await this.syncInvoiceData();
      await this.syncCarbonOffsetData();
      logger.info('Full data warehouse sync completed successfully');
    } catch (error) {
      logger.error('Error during full data warehouse sync', { error });
      throw error;
    }
  }
}
