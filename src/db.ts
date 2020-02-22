import * as mysql from 'mysql';
class MysqlConnection {
    
    constructor(public connection: mysql.PoolConnection){

    }

    public async query(sql: string):Promise<any> {
        return new Promise((resolve,reject)=>{
            this.connection.query(sql,(err,result)=>{
                if(err) reject(err);
                else resolve(result)
            });
        }) 
    }
}
class MysqlDatabase {
    pool: mysql.Pool;
    constructor(option: mysql.PoolConfig) {
        console.log("DataBase Created!");
        this.pool = mysql.createPool(option);
    }
    public async getConnection(): Promise<MysqlConnection>{
        return new Promise((resolve,reject)=>{
            this.pool.getConnection((err,connection)=>{
                if(err) reject(err);
                else resolve(new MysqlConnection(connection));
            });
        }); 
    }
    public async queryOnce(sql: string){
        const conn = await this.getConnection();
        const result = conn.query(sql);
        conn.connection.release();
        return result;
    }   
    
};
const option:mysql.PoolConfig = {
    host: "***",
    user: "***",
    password: "***",
    database: "***"
}
option["database"] = process.env.NODE_ENV == "test"? "TestJNUSTU" : "JNUSTU"
const db = new MysqlDatabase(option);

export {
    db
}