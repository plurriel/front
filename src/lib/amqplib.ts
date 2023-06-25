import amqplib from 'amqplib';

// console.log(process.env);

export const conn = ((globalThis as any).conn as amqplib.Connection | undefined)
  || await amqplib.connect(process.env.AMQP_URL as string);
(globalThis as any).conn = conn;
export const channel = ((globalThis as any).channel as amqplib.Channel | undefined)
  || await conn.createChannel();
