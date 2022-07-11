import * as admin from 'firebase-admin'
import * as express from 'express'

const db = admin.firestore()
const router = express.Router()

// api 주소: localhost:5001/react-shop-3651f/us-central1/api/shop/

interface Product {
  title: string
  like: boolean
  createdAt?: string
  updatedAt?: string
}

// 목록 조회
router.get('/', async (req, res) => {
  // 모든 도큐먼트 조회, 반환
  // 메서드로 필터링 구현 가능 -> .where('like', '==', 'true').where('title', '==', '프로스태프')
  // snpas는 검색된 결과 도큐먼트들! 배열데이터 처럼 쓰임(유사배열객체)
  const snaps = await db.collection('Products').get()

  const products: (Product & { id: string })[] = []
  snaps.forEach((snap) => {
    const fields = snap.data()
    products.push({
      id: snap.id,
      ...(fields as Product)
    })
  })

  res.status(200).json(products)
})

// 제품 포스팅
router.post('/', async (req, res) => {
  const { title } = req.body
  const products: Product = {
    title,
    like: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  // 컬렉션(collection)을 만들고 도큐먼트 생성(add)
  // 생성하는 것을 비동기 처리

  // 제품 생성시 만들어지는 id는 도큐먼트의 id
  // ref는 파이어베이스에서 만들어지는 됴큐먼트 통상 ref라고 씀
  const ref = await db.collection('Products').add(products)

  res.status(200).json({
    id: ref.id,
    ...products
  })
})

// router.put('')
// router.delete('')

export default router
