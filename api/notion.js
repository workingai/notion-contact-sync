export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, phone } = req.body;
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const DATABASE_ID = process.env.DATABASE_ID;

    if (!NOTION_API_KEY || !DATABASE_ID) {
        return res.status(500).json({ message: 'Vercel 환경 변수 설정이 필요합니다. (NOTION_API_KEY, DATABASE_ID)' });
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
                    '이름': {
                        title: [{ text: { content: name } }]
                    },
                    '전화번호': {
                        rich_text: [{ text: { content: phone } }]
                    }
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, data });
        } else {
            return res.status(response.status).json({ message: data.message || '노션 데이터 전송 실패' });
        }
    } catch (error) {
        return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
}
