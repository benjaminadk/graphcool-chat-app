import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import './index.css'
import { ApolloProvider } from 'react-apollo'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { FREECOM_AUTH_TOKEN_KEY } from './constants'

const wsClient = new SubscriptionClient(`wss://subscriptions.us-west-2.graph.cool/v1/cj797apkm1utp01899t4y8lhx`, {
  reconnect: true,
  connectionParams: {
    authToken: window.localStorage.getItem(FREECOM_AUTH_TOKEN_KEY)
  }
})

const networkInterface = createNetworkInterface({uri:`https://api.graph.cool/simple/v1/cj797apkm1utp01899t4y8lhx`})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
  )

networkInterface.use([{
  applyMiddleware(request, next) {
    if(!request.options.headers){
      request.options.headers = {}
    }
    
    const token = window.localStorage.getItem(FREECOM_AUTH_TOKEN_KEY)
    console.log(wsClient.connectionParams.authToken)
    request.options.headers['Authorization'] = token ? `Bearer ${token}` : null
    next()
  }
}])

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  dataIdFromObject: o => o.id
})

const freecom = {
  render,
  companyName: 'Graphcool',
  companyLogoURL: 'http://imgur.com/qPjLkW0.png',
  mainColor: 'rgba(39,175,96,1)'
}

function render(element) {

  if (!element) {
    const root = document.createElement('div')
    root.id = '__freecom-root__'
    document.body.appendChild(root)
    element = root
  }

  ReactDOM.render(
    <ApolloProvider client={client}>
      <App freecom={freecom}/>
    </ApolloProvider>
    ,
    element
  )
}

render(document.getElementById('__freecom-root__'))