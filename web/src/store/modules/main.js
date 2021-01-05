const state = {
  model: '',
  type: '',
  imgFiles: []
}

const mutations = {
  CHANGE_CONFIG(state, payload) {
    console.log(payload)
    state.model = payload.model
    state.type = payload.type
    state.imgFiles = payload.imgFiles
    // console.log(state.imgFiles)
    localStorage.setItem('files', JSON.stringify(state.imgFiles))
    localStorage.setItem('model', state.model)
    localStorage.setItem('type', state.type)
  }
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
