export const isNewHashFragment = () => {
  const { branches } = parseHashFragment()
  const last = sessionStorage.getItem('lastBranches')
  if (!last) {
    return true
  }
  return branches.join('/') !== last
}
export const setHashFragment = (branches: string[]) => {
  console.log('setHashFragment', branches)
  setFragment(branches)
  sessionStorage.setItem('lastBranches', branches.join('/'))
}

export const parseHashFragment = () => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const string = params.get('branches')
  if (!string) {
    return { branches: [] }
  }
  return { branches: string.split('/') }
}

export const setFragment = (branches: string[]) => {
  window.location.hash = 'branches=' + branches.join('/')
  console.log('setFragment', window.location.hash)
}
