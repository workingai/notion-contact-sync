import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Vercel용 API 엔드포인트
app.post('/api/notion', async (req, res) => {
    const { name, phone } = req.body;
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const DATABASE_ID = process.env.DATABASE_ID;

    if (!NOTION_API_KEY || !DATABASE_ID) {
        return res.status(500).json({ message: 'Vercel 환경 변설 설정이 되지 않았습니다.' });
    }

    try {
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: DATABASE_ID },
                properties: {
                    '이름': { title: [{ text: { content: name } }] },
                    '전화번호': { rich_text: [{ text: { content: phone } }] }
                }
            })
        });

        const data = await response.json();
        if (response.ok) {
            res.status(200).json({ success: true, data });
        } else {
            res.status(response.status).json({ message: data.message || '노션 전송 실패' });
        }
    } catch (error) {
        res.status(500).json({ message: '서버 오류 발생' });
    }
});

// Vercel은 app을 export해야 합니다.
export default app;
