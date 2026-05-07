// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import db from '@/pages/api/config/connectDB';
import defaultResponse from '@/pages/api/config/defaultResponse';

const handler = async (req, res) => {
  try {
    const connected = await db.connect();
    
    if(!connected){
      return res.status(400).json(defaultResponse('Erro de conexão com o banco de dados'));
    }
    res.status(200).json({ mensagem: "The API os ok :)" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(defaultResponse());
  }
}


export default handler;