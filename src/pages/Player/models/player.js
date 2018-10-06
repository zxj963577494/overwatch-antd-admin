import {
  getPlayersById,
  getPlayersByPage,
  getTotal,
  postPlayers,
  removePlayers,
} from '@/services/players'
import { postSocial, removeSocial } from '@/services/social'

export default {
  namespace: 'player',

  state: {
    data: {
      list: [],
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
    },
  },

  effects: {
    *fetchById({ payload, callback }, { call }) {
      const response = yield call(getPlayersById, payload)
      if (callback) callback(response)
    },
    *fetch({ payload }, { call, put, select }) {
      const _pagination = yield select(state => state.player.data.pagination)
      const page = Object.assign({}, _pagination, payload.pagination)
      const total = yield call(getTotal)
      if (_pagination.total > total && total % page.pageSize === 0) {
        page.currentPage -= 1
      }
      const list = yield call(getPlayersByPage, payload, page)
      yield put({
        type: 'show',
        payload: {
          list,
          pagination: {
            ...page,
            total,
          },
        },
      })
    },
    *submit({ payload, callback }, { call }) {
      const { accounts } = payload
      const player = payload
      delete player.accounts
      const response = yield call(postPlayers, player)
      yield call(removeSocial, payload)
      yield call(postSocial, accounts, response.objectId)
      if (callback) {
        callback()
      }
    },
    *remove({ payload, callback }, { call }) {
      yield call(removePlayers, payload)
      yield call(removeSocial, payload)
      if (callback) {
        callback()
      }
    },
  },

  reducers: {
    show(state, { payload }) {
      return {
        ...state,
        data: {
          ...state.data,
          list: payload.list.map(x => {
            return {
              ...x,
              key: x.objectId,
            }
          }),
          pagination: payload.pagination,
        },
      }
    },
  },
}