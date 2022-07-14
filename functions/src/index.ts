import * as admin from 'firebase-admin'
admin.initializeApp()

import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import shopRouter from './routes/shop'

const app = express()
app.use(express.json()) // json 파일을 해석하는 메서드
// cors 별도의 요청 없으면 모든 요청 혀용
app.use(cors())
// {로컬 3000번 포트만 요청 가능
// origin: ['http://localhost:3000']}
app.use('/api', shopRouter)
// api 주소(로컬): http://localhost:5001/react-shop-3651f/us-central1/shop/api

export const shop = functions.https.onRequest(app)
