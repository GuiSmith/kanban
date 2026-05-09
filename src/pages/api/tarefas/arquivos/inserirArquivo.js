// DB
import db from '@/pages/api/config/connectDB';
import { buildInsert } from '@/pages/api/utils/buildInsert';

// Js
import axios from 'axios';

// Utils
import parseForm from '@/pages/api/utils/parseForm';
import readFileAsync from '@/pages/api/utils/readFileAsync';
import maxSize from '@/pages/api/utils/maxSize';
import defaultResponse from '@/pages/api/config/defaultResponse';
import getCurrentUrl from '@/pages/api/config/getCurrentUrl';
import buildImgSrc from '@/pages/api/utils/buildImgSrc';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
    try {
        const maxSizeMb = 22;
        const maxSizeByte = maxSize(maxSizeMb); // 22MB
        const extensoesPermitidas = ['pdf', 'jpg', 'png', 'jpeg'];

        // Extraindo dados
        const { fields, files } = await parseForm(req);
        const arquivo = Array.isArray(files?.arquivo) ? files.arquivo[0] : files?.arquivo;
        const nome = Array.isArray(fields?.nome) ? fields.nome[0] : fields?.nome;
        const idTarefa = Array.isArray(fields?.id_tarefa) ? fields.id_tarefa[0] : fields?.id_tarefa;

        // Validando dados
        if (!arquivo) {
            return res.status(400).json(defaultResponse('Nenhum arquivo foi enviado'));
        }
        if (!nome) {
            return res.status(400).json(defaultResponse('Informe o nome do arquivo'));
        }
        if (!idTarefa){
            return res.status(400).json(defaultResponse('Informe a tarefa!'));
        }

        const tarefa = await db.query({ text: 'SELECT id FROM tarefa WHERE id = $1', values: [idTarefa]});

        if (!tarefa){
            return res.status(400).json(defaultResponse('Tarefa não encontrada!'));
        }

        // Validando tamanho do arquivo
        const fileBuffer = await readFileAsync(arquivo.filepath);
        if (fileBuffer.length > maxSizeByte) {
            return res.status(400).json(defaultResponse(`Arquivo deve ter no máximo ${maxSizeMb} MB`));
        }

        // Validando tipo do arquivo
        const extensao = arquivo.originalFilename.split('.').pop();
        if (!extensoesPermitidas.includes(extensao)) {
            return res.status(400).json(defaultResponse(`Extensões permitidas: ${extensoesPermitidas.join(', ')}`));
        }

        // Publicando foto
        const url = `${process.env.OPERA_LINK}/files`;
        const response = await axios.post(url, fileBuffer, {
            headers: {
                authorization: process.env.OPERA_API_KEY,
                'Content-Type': 'application/octet-stream',
                'x-file-extension': extensao,
                'x-folder-id': process.env.OPERA_FOLDER_ID
            },
        });

        // Inserindo no BD
        const tarefaArquivoData = {
            id_tarefa: idTarefa,
            nome: nome,
            public_url: response.data.content.public_url
        };
        const tarefaArquivoInsert = buildInsert('tarefa_arquivo',tarefaArquivoData);
        const tarefaArquivo = await db.query({ text: tarefaArquivoInsert.text, values: tarefaArquivoInsert.values });

        if (!tarefaArquivo){
            return res.status(400).json(defaultResponse('Erro ao salvar arquivo no banco de dados!'));
        }

        const dadosNaoEnviados = ['public_url'];
        const returnObj = {};

        for(const key in tarefaArquivo) {
            if(!dadosNaoEnviados.includes(key)){
                returnObj[key] = tarefaArquivo[key];
            }
        }

        returnObj.src = buildImgSrc(tarefaArquivo.public_url);

        return res.status(200).json(defaultResponse('Arquivo registrado', { ...returnObj }));
    } catch (error) {
        console.log(error);
        return res.status(500).json(defaultResponse('Erro interno ao salvar arquivos'));
    }
};

export default handler;
