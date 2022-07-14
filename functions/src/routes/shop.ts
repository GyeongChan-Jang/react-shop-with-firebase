import * as admin from 'firebase-admin'
import * as express from 'express'
import { MAX_TIMEOUT_SECONDS } from 'firebase-functions/v1'

const db = admin.firestore()
const router = express.Router()

// api 주소: http://localhost:5001/react-shop-3651f/us-central1/shop/api

interface Product {
  id?: string
  title: string
  like: boolean
  createdAt: string
  updatedAt: string
  deleted: boolean
}

// job: db수정하는 명령
// 한 번만 쓰는 함수 - 모든 데이터의 속성을 추가해줄 때 주로 이런식으로 사용
// async function addDeleted() {
//   const snaps = await db.collection('Products').get()

//   // forEach안으로 들어가서 콜백함수가 실행되기 때문에 그 안에서는 비동기를 보장하지 않는다.
//   for (const snap of snaps.docs) {
//     snap.ref.update({
//       deleted: false
//     })
//   }
//   console.log('완료')
// }

// 목록 조회
router.get('/', async (req, res) => {
  // 모든 도큐먼트 조회, 반환
  // 메서드로 필터링 구현 가능 -> .where('like', '==', 'true').where('title', '==', '프로스태프')
  // snpas는 검색된 결과 도큐먼트들! 배열데이터 처럼 쓰임(유사배열객체)
  const snaps = await db
    .collection('Products')
    // 삭제인 것 처럼 필터링
    .where('deleted', '!=', true)
    .get()

  const products: Product[] = []

  snaps.forEach((snap) => {
    const fields = snap.data()
    products.push({
      id: snap.id,
      ...(fields as Product)
    })
  })

  // 최신일 기준으로 정렬
  products.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return bTime - aTime
  })

  res.status(200).json(products)
})

// 제품 포스팅
router.post('/', async (req, res) => {
  const { title, like } = req.body
  const date = new Date().toISOString()
  const products: Product = {
    title,
    like,
    createdAt: date,
    updatedAt: date,
    deleted: false
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
  if (!snap.exists) {
    return res.status(404).json('존재하지 않는 제품 정보입니다.')
  }
  const { createdAt } = snap.data() as Product
  const updatedAt = new Date().toDateString()
  await snap.ref.update({
    title,
    like,
    updatedAt
  })

  return res.status(200).json({
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
  if (!snap.exists) {
    return res.status(404).json('존재하지 않는 제품 정보입니다.')
  }
  await snap.ref.update({
    deleted: true
  })

  res.status(200).json('삭제 되었습니다!')
  return
})

export default router
