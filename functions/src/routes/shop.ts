import * as admin from 'firebase-admin'
import * as express from 'express'

const db = admin.firestore()
const router = express.Router()

// api 주소: localhost:5001/react-shop-3651f/us-central1/api/shop

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
  const snaps = await db
    .collection('Products')
    // 삭제인 것 처럼 필터링
    // .where('deleted', '!=', true)
    .get()

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
  const { title, like } = req.body
  const products: Product = {
    title,
    like,
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

// 제품 수정
router.put('/:id', async (req, res) => {
  const { title, like } = req.body
  const { id } = req.params

  // 스냅샷
  const snap = await db.collection('Products').doc(id).get()
  const { createdAt } = snap.data() as Product
  const updatedAt = new Date().toDateString()
  await snap.ref.update({
    title,
    like,
    updatedAt
  })

  res.status(200).json({
    id: snap.id,
    title,
    like,
    createdAt,
    updatedAt
  })
})

// 제품 삭제
// db에서 데이터 삭제하려면 delete() 사용
// 삭제인 것 처럼 보이기 -> deleted에 true를, 그리고 get할 때 filter 사용!
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  const snap = await db.collection('Products').doc(id).get()
  await snap.ref.update({
    deleted: true
  })

  res.status(200).json('삭제 되었습니다!')
})

export default router
