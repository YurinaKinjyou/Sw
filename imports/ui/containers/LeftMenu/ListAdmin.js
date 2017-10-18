import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import classNames from 'classnames'
import Collapse from 'material-ui/transitions/Collapse'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List'
import IconButtonMoreExpand from '/imports/ui/components/UI-IconButtonMoreExpand'
import styles from './ListDefault.style'

@withStyles(styles)
@inject('routes', 'accounts', 'router')
@observer
export default class LeftMenuChannels extends Component {
  render () {
    const {accounts, classes} = this.props
    return (
      <List>
        <ListItem button dense
          className={classNames({
            // [classes.select]: this.props.routes.page.includes('admin')
          })}
          component='a'
          href='/admin'>
          <ListItemText primary={this.props.accounts.isLogged ? accounts.username : 'login'} />
          {this.props.accounts.isLogged &&
          <ListItemSecondaryAction>
            <IconButtonMoreExpand isExpand={this.state.isExpand} onClick={this.onExpand} />
          </ListItemSecondaryAction>}
        </ListItem>
        <Collapse in={this.state.isExpand} transitionDuration='auto' unmountOnExit>
          {this.props.accounts.isLogged &&
          <ListItem button dense component='a' href='/twitter'>
            <ListItemText inset primary='Twitter' />
          </ListItem>}
          {this.props.accounts.isLogged &&
          <ListItem button dense
            className={classNames({
              // [classes.select]: this.props.routes.page.includes('config')
            })}
            component='a'
            href='/config'>
            <ListItemText inset primary='config' />
          </ListItem>}
          {this.props.accounts.isLogged &&
          <ListItem button dense onClick={this.onLogout}>
            <ListItemText inset primary='logout' />
          </ListItem>}
        </Collapse>
      </List>
    )
  }

  state = {isExpand: false}

  onExpand = () => { this.setState({isExpand: !this.state.isExpand}) }

  onLogout = () => {
    this.props.accounts.logout()
    .then(() => { this.props.snackbar.show('ログアウトしました') })
    .catch(err => this.props.snackbar.error(err.reason))
  }
}