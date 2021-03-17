import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

// firebase.initializeApp(firebaseConfig);
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}else {
  firebase.app(); // if already initialized, use that one
}
function App() {

  const [newUser, setNewUser] = useState(false)

  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
  })

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const {displayName, photoURL, email} = result.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        photo: photoURL,
        email: email
      }
      setUser(signedInUser)

    console.log(displayName, photoURL, email)
    }).catch((error) => {
    
    console.log(error)
  });
  }


  const handleFbSignIn = () => {
    firebase
    .auth()
    .signInWithPopup(fbProvider)
    .then((result) => {
      // The signed-in user info.
      const user = result.user;
      console.log('fb user : ', user)
    })
    .catch((error) => {
      // Handle Errors here.
      const errorMessage = error.message;
      console.log(errorMessage)
    });
  }


  const handleSignOut = ()=> {
    firebase.auth().signOut()
    .then((res) => {
      const signOutUser = {
        userSignedIn: false,
        name:'',
        photoURL:'',
        email: '',
        error: '',
        success: false
      }
      setUser(signOutUser)
      // Sign-out successful.
    }).catch((error) => {
      console.log(error)
    })
    
  }




    const handleSubmit = (event) => {
      if(newUser && user.email && user.password){
        firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(result => {
          const newUserInfo = {...user}
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          updateUserName(user.name)
        })
        .catch((error) => {
        const  newUserInfo = {...user}
        newUserInfo.error = error.message
        newUserInfo.success = false
        setUser(newUserInfo)
        // ..
    });

      }

      if (!newUser && user.email && user.password) {
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((result) => {
          const newUserInfo = {...user}
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          console.log('sign in user info', result)
    })
      .catch((error) => {
        const  newUserInfo = {...user}
        newUserInfo.error = error.message
        newUserInfo.success = false
        setUser(newUserInfo)
    });
      }
      event.preventDefault()
    }


    const updateUserName = name => {
      const user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: name,
      }).then(() => {
        console.log('Username updated successfully')
      }).catch((error) => {
        console.log(error)
      });
    }


    const handleChange =  (event)=> {
      let fieldValid = true;
      if(event.target.name === 'email'){
        fieldValid = /\S+@\S+\.\S+/.test(event.target.value);
      }
      if(event.target.name === 'password'){
        const isPasswordValid =  event.target.value.length > 6
        const passwordHasNumber = /\d{1}/.test(event.target.value);
        fieldValid = passwordHasNumber && isPasswordValid
      }
      if(fieldValid){
        const newUserInfo = {...user};
        newUserInfo[event.target.name] = event.target.value;
        setUser(newUserInfo);
      }
    }

  return (
    <div className="App">
    {  
      user.isSignedIn ?
      <button style={{backgroundColor:'red',color:'white'}} onClick={handleSignOut}>Sign out</button>
      :
      <button style={{
        border:'none',
        cursor:'pointer',
        padding:'20px',
        margin:'40px 0px',
        boxShadow:'2px 5px 5px lightgray',
        borderRadius: '10px',
        backgroundColor:'orange' ,color:'black'}} onClick={handleSignIn}>Sign in with Google</button>
    }
    <br/>
    
    <button style={{
      border:'none',
      cursor:'pointer',
      boxShadow:'2px 5px 5px lightgray',
      borderRadius: '10px',
      padding:'20px',
      backgroundColor:'blue' ,
      color:'white'}}
      onClick={handleFbSignIn}
      >Login using Facebook</button>
    <br/>
    
        {
          user.isSignedIn && 
          <div>
            <p>Welcome, {user.name}</p>
            <p>Your Email: {user.email}</p>
            <img src={user.photo} alt=""/>
          </div> 
          
        }

        <h1 style={{
          fontWeight:'700',
          color:'gray'
        }}>Our own authentication system</h1>

        <section style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <div style={{
          boxShadow:'5px 5px 20px lightgray',
          borderRadius: '10px',
          padding:'20px',
          width:'500px',
          margin:'20px 0px',
        }}>
          
          <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
        <label htmlFor="newUser">New User Sign Up</label>

        <form  onSubmit={handleSubmit}>
          {newUser  && <input type="text" onChange={handleChange}  name="name" placeholder="Your Name" required/>}
          <br/>
          <input type="text" onChange={handleChange} placeholder="Your Email Address" name="email"  required/>
          <br/>
          <input type="password" onChange={handleChange} name="password" id="" placeholder="Your Password" required/>
          <br/>
          <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
        </form>
        {
          user.success ? <p style={{color: 'green'}}>User {newUser ? 'Created' : 'Logged in'} Successfully</p> : <p style={{color: 'red'}}>{user.error}</p>
        }

        </div>        

        </section>
                
    </div>
  );
}

export default App;
