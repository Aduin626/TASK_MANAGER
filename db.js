import pg from 'pg';
const {Pool}= pg 
let localPoolConfig ={
  user: "postgres",
  password: "626458510A",
  host: "localhost",
  port: 5432,
  database: "task_manager",
}

const poolConfig= process.env.DATABASE_URL ? {
   connectionString:process.env.DATABASE_URL,
   ssl:{rejectUnauthorized:false}
  }: localPoolConfig

  const pool=new Pool(poolConfig);
  export default pool

