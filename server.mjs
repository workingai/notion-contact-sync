import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 보안 강화: 환경 변수에서 정보를 읽어옵니다.
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID;

app.use(cors());
app.use(express.json());

app.post('/api/notion', async (req, res) => {
    const { name, phone } = req.body;

    if (!DATABASE_ID || DATABASE_ID.includes('여기에')) {
        return res.status(400).json({ message: '서버 설정에서 DATABASE_ID를 먼저 입력해주세요!' });
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
                    // 노션 컬럼 이름이 '이름'인지 확인하세요 (Title 타입)
                    '이름': {
                        title: [
                            { text: { content: name } }
                        ]
                    },
                    // 노션 컬럼 이름이 '전화번호'인지 확인하세요 (Rich Text 또는 Phone 타입)
                    '전화번호': {
                        rich_text: [
                            { text: { content: phone } }
                        ]
                    }
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            res.status(200).json({ success: true, data });
        } else {
            console.error('Notion API Error:', data);
            res.status(response.status).json({ message: data.message || '노션 데이터 전송 실패' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ 서버가 실행되었습니다: http://localhost:${PORT}`);
    console.log(`🚀 웹페이지(index.html)를 브라우저로 열어서 테스트해보세요.`);
});
