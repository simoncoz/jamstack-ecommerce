import React from 'react'
import SignUp from '../components/formComponents/SignUp'
import ConfirmSignUp from '../components/formComponents/ConfirmSignUp'
import SignIn from '../components/formComponents/SignIn'
import Inventory from '../templates/Inventory'
import { Auth } from 'aws-amplify'

class Admin extends React.Component {
  state = { formState: 'signUp', isAdmin: false }
  toggleFormState = (formState) => {
    this.setState(() => ({ formState }))
  }
  async componentDidMount() {
    const user = await Auth.currentAuthenticatedUser()
    const { signInUserSession: { idToken: { payload }}} = user
    if (payload["cognito:groups"] && payload["cognito:groups"].includes("Admin")) {
      this.setState({ formState: 'signedIn', isAdmin: true })
    }
  }
  signUp = async (form) => {
    const { username, email, password } = form
    // step 1: Sign up a new user
    await Auth.signUp({
      username, password, attributes: { email }
    })
    this.setState({ formState: 'confirmSignUp' })
  }
  confirmSignUp = async (form) => {
    const { username, authcode } = form
    // step 2: Use MFA to confirm the new user
    await Auth.confirmSignUp(username, authcode)
    this.setState({ formState: 'signIn' })
  }
  signIn = async (form) => {
    const { username, password } = form
    // step 3: Sign in the new user
    await Auth.signIn(username, password)
    // step 4: Check to see if the user is an Admin, if so, show the inventory view.
    const user = await Auth.currentAuthenticatedUser()
    const { signInUserSession: { idToken: { payload }}} = user
    if (payload["cognito:groups"] && payload["cognito:groups"].includes("Admin")) {
      this.setState({ formState: 'signedIn', isAdmin: true })
    }
  }
  signOut = async() => {
    // allow users to sign out
    await Auth.signOut()
    this.setState({ formState: 'signUp' })
  }

  render() {
    const { formState, isAdmin } = this.state
    const renderForm = (formState, state) => {
      switch(formState) {
        case 'signUp':
          return <SignUp {...state} signUp={this.signUp} toggleFormState={this.toggleFormState} />
        case 'confirmSignUp':
          return <ConfirmSignUp {...state} confirmSignUp={this.confirmSignUp} />
        case 'signIn':
          return <SignIn {...state} signIn={this.signIn} toggleFormState={this.toggleFormState} />
        case 'signedIn':
          return isAdmin ? <Inventory {...state} signOut={this.signOut} /> : <h3>Not an admin</h3>
        default:
          return null
      }
    }
    
    return (
      <div className="flex flex-col">
        <div className="max-w-fw flex flex-col">
          <div className="pt-10">
            <h1 className="text-5xl font-light">Admin Panel</h1>
          </div>
          {
            renderForm(formState)
          }
        </div>
      </div>
    )
  }
}

export default Admin