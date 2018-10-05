import Bmob from 'hydrogen-js-sdk'

export async function getSports() {
  const query = Bmob.Query('Sport')
  return query.find()
}

export async function getSportsById(id) {
  const query = Bmob.Query('Sport')
  return query.get(id)
}

export async function getTotal() {
  const query = Bmob.Query('Sport')
  return query.count()
}

export async function getSportsByPage(payload, pagination) {
  const query = Bmob.Query('Sport')

  const { order = 'updateAt' } = payload

  if (pagination) {
    const { currentPage, pageSize } = pagination
    const skipCount = (currentPage - 1) * pageSize
    query.skip(skipCount)
    query.limit(pageSize)
  }

  query.order(order)

  return query.find()
}

export async function postSports(payload) {
  const query = Bmob.Query('Sport')
  const params = []
  for (const i in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, i)) {
      params.push({
        key: i,
        value: payload[i],
      })
    }
  }
  params.forEach(data => {
    query.set(data.key, data.value)
  })
  return query.save()
}

export async function putSports(payload) {
  const query = Bmob.Query('Sport')
  const params = []
  for (const i in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, i)) {
      params.push({
        key: i,
        value: payload[i],
      })
    }
  }
  params.forEach(data => {
    query.set(data.key, data.value)
  })
  return query.save()
}

export async function removeSports(payload) {
  const query = Bmob.Query('Sport')
  const { objectId } = payload
  return query.destroy(objectId)
}
