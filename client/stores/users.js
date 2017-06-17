import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { action, observable } from 'mobx'

export default class {
  @observable one = {}

  @observable followsIds = []

  @observable loginState = null

  cursor = null

  address = null // ipアドレス

  unique = null // ユニークID

  get _id () { return Accounts.userId() }

  get username () { return this.one.username }

  get networks () { return this.one.profile.networks }

  get profile () { return this.one.profile }

  get follows () { return this.one.profile.follows }

  get services () { return this.one.services }

  get createdAt () { return this.one.createdAt }

  // 未ログインのときtrueを返す
  get isNotLoggedIn () {
    return this.loginState === 'isNotLoggedIn'
  }

  // ログイン中のときtrueを返す
  get isLoggingIn () {
    return this.loginState === 'isLoggingIn'
  }

  // ログイン済みのときtrueを返す
  get isLogged () {
    return this.loginState === 'isLoggedIn'
  }

  // ipアドレスを取得する
  fetchAddress () {
    return new Promise((resolve, reject) => {
      Meteor.call('users.fetchAddress', (err, res) => {
        if (err) {
          reject(err)
        } else {
          this.address = res.address
          this.unique = res.unique
          resolve()
        }
      })
    })
  }

  insert ({username, password}) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.insert', {username, password}, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  // フォローを更新する
  updateFollow (userId) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.updateFollow', {userId}, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // ネームを更新する
  updateName (name) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.setName', {name}, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // ユーザネームを更新する
  updateUsername (username) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.updateUsername', {username}, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  checkExistUsername (username) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.checkExistUsername', username, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  updateChannel (channel) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.updateChannel', {
        channel: channel
      }, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  updatePassword (oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      Accounts.changePassword(oldPassword, newPassword, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  addEmail (email) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.addEmail', {email}, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  removeEmail (email) {
    return new Promise((resolve, reject) => {
      Meteor.call('users.removeEmail', {email}, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // ログインする
  @action
  onLogin () {
    const self = this
    Meteor.subscribe('users')
    if (self.cursor) {
      self.cursor.stop()
      self.cursor = null
    }
    const userId = Meteor.userId()
    self.cursor = Meteor.users.find(userId).observe({
      added (user) {
        user.profile.code = user.profile.code.split('')
        self.one = user
        self.followsIds = user.profile.follows.map(item => item._id)
        setTimeout(() => { self.loginState = 'isLoggedIn' }, 200)
      },
      changed (user) {
        user.profile.code = user.profile.code.split('')
        self.one = user
        self.followsIds = user.profile.follows.map(item => item._id)
      }
    })
  }

  @action
  onLogout () {
    this.loginState = 'isNotLoggedIn'
  }

  // ログアウトする
  logout () {
    return new Promise((resolve, reject) => {
      Meteor.logout(err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  constructor () {
    if (Meteor.loggingIn()) {
      this.loginState = 'isLoggingIn'
    } else {
      this.loginState = 'isNotLoggedIn'
    }
    Accounts.onLogin(this.onLogin.bind(this))
    Accounts.onLogout(this.onLogout.bind(this))
  }
}