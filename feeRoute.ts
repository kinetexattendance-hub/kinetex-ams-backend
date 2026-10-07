import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';

export async function feeRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  // 1. Get All Fee Charges & Status
  fastify.get('/', async (request, reply) => {
    try {
      const result = await pool.query(
        `SELECT f.id, f.student_id, s.name as student_name, f.amount, f.due_date, f.status 
         FROM monthly_fee_charges f 
         JOIN students s ON f.student_id = s.id 
         ORDER BY f.due_date DESC`
      );
      return reply.send({ status: 'success', data: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to fetch fee charges' });
    }
  });

  // 2. Record Payment
  fastify.post('/pay', async (request, reply) => {
    const { student_id, amount, payment_mode } = request.body as {
      student_id: string;
      amount: number;
      payment_mode: string;
    };

    if (!student_id || !amount) {
      return reply.status(400).send({ message: 'Student ID and amount are required' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO payments (student_id, amount, payment_mode) 
         VALUES ($1, $2, $3) RETURNING *`,
        [student_id, amount, payment_mode || 'cash']
      );
      return reply.status(201).send({ status: 'success', data: result.rows[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to record payment' });
    }
  });
}