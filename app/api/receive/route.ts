import PostalMime from 'postal-mime'
import { MongoClient } from 'mongodb'

// 连接 MongoDB
const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db('mailbox')
const inbox = db.collection('inbox')

export async function POST(req: Request): Promise<Response> {
  // 从请求中解析邮件数据
  const { from, to, mail, auth }: { from: string, to: string, mail: string, auth: string } = await req.json()
  if (auth !== process.env.PEER_AUTH_KEY) {
    return new Response('Unauthorized', { status: 401 })
  }
  const data = await PostalMime.parse(mail)
  // 将邮件数据插入到收件箱
  await inbox.insertOne({ ...data, workers: { from, to } })
  return new Response('OK')
}