import express from "express";
import cors from "cors";

import Pool from "pg-pool";

const mundoInvestDatabaseConfig = {
  user: "projection",
  password: "63c400950c66e382d4a0f49a959e112b",
  host: "projection-projection.cs1diitcbi95.sa-east-1.rds.amazonaws.com",
  port: 5438,
  database: "production",
};

const poolMI = new Pool(mundoInvestDatabaseConfig);

const app = express();
app.use(express.json())
app.use(cors());

app.get("/newUsers", async (req, res) => {
  const query = await poolMI.query(`
    SELECT COUNT(*) AS total_usuarios, DATE_TRUNC('day', created_at) AS data
    FROM users
    WHERE created_at >= '2023-05-01'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY data DESC
  `)

  return res.json(query.rows)
})

app.get("/investorProfile", async (req, res) => {
  const conservador = await poolMI.query(`
    select count(*) from users where "investorProfile" = 'conservador'
  `)

  const moderado = await poolMI.query(`
    select count(*) from users where "investorProfile" = 'moderado'
  `)

  const agressivo = await poolMI.query(`
    select count(*) from users where "investorProfile" = 'agressivo'
  `)

  const resObj = [
    { property: "Conservador", value: Number(conservador.rows[0].count) },
    { property: "Moderado", value: Number(moderado.rows[0].count) },
    { property: "Agressivo", value: Number(agressivo.rows[0].count) }
  ]

  return res.json(resObj)
})

app.get("/emergencyReserve", async (req, res) => {
  const haveEmergencyReserve = await poolMI.query(`
      select count(*) from users where emergency_reserve is not null
  `)

  const dontHaveEmergencyReserve = await poolMI.query(`
      select count(*) from users where emergency_reserve is null
  `)

  const resObj = [
    { property: "SIM", value: Number(haveEmergencyReserve.rows[0].count) }, 
    { property: "NAO", value: Number(dontHaveEmergencyReserve.rows[0].count) }
  ]

  return res.json(resObj)
})

app.get("/investorAges", async (req, res) => {
  let qtdPeople18To24 = 0;
  let qtdPeople25To30 = 0;
  let qtdPeople31To40 = 0;
  let qtdPeople41To50 = 0;
  let qtdPeople51To60 = 0;
  let qtdPeople61To70 = 0;
  let qtdPeople71To80 = 0;
  let qtdPeople81To90 = 0;
  let qtdPeople91To100 = 0;
  const result = await poolMI.query(`
    select count(id), FLOOR("currentAge") as age from users
    where "currentAge" >= 18 and FLOOR("currentAge") = "currentAge" and "currentAge" <= 100
    group by FLOOR("currentAge")
    order by FLOOR("currentAge") asc
`)

  result.rows.forEach(({ count, age }: { count: string, age: number }) => {
    const q = Number(count);
    if(age >= 18 && age <= 24){
      qtdPeople18To24 += q;
    } else if (age >= 25 && age <= 30){
      qtdPeople25To30 += q;
    } else if (age >= 31 && age <= 40){
      qtdPeople31To40 += q;
    } else if (age >= 41 && age <= 50){
      qtdPeople41To50 += q;
    } else if (age >= 51 && age <= 60){
      qtdPeople51To60 += q;
    } else if (age >= 61 && age <= 70){
      qtdPeople61To70 += q;
    } else if (age >= 71 && age <= 80){
      qtdPeople71To80 += q;
    } else if (age >= 81 && age <= 90){
      qtdPeople81To90 += q;
    } else if (age >= 91 && age <= 100){
      qtdPeople91To100 += q;
    }
  })

  const resObj = [
    { name: "18-24", value: qtdPeople18To24 },
    { name: "25-30", value: qtdPeople25To30 },
    { name: "31-40", value: qtdPeople31To40 },
    { name: "41-50", value: qtdPeople41To50 },
    { name: "51-60", value: qtdPeople51To60 },
    { name: "61-70", value: qtdPeople61To70 },
    { name: "71-80", value: qtdPeople71To80 },
    { name: "81-90", value: qtdPeople81To90 },
    { name: "91-100", value: qtdPeople91To100 },
  ]

  return res.json(resObj)
})


app.listen(9000, () => console.log(`Servidor rodando na porta 9000!`));
