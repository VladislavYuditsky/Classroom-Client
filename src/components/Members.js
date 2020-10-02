import React from 'react';
import {Nav, Navbar, NavDropdown, Table} from "react-bootstrap";
import SockJsClient from 'react-stomp';
import {history} from "../utils";
import * as axios from "axios";
import hand from '../hand.svg';

class Members extends React.Component {
    constructor(props) {
        super(props);

        let userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        this.state = {
            username: userData ? userData.username : '',
            user: userData,
            isHandUp: userData ? userData.handUp : false,
            users: null,
            roles: userData ? userData.roles : ['STUDENT']
        }
    }

    componentWillMount() {
        if (!this.state.user) {
            history.replace('/login');
        }

        axios.get('http://localhost:8080/users')
            .then((response) => {
                this.setState({
                    users: response.data
                })
            });
    }

    sendMessage = () => {
        this.clientRef.sendMessage('/app/updateState');
    };

    handAction = () => {
        axios.post('http://localhost:8080/handAction', {
            username: this.state.username
        })
            .then(() => {
                this.setState({
                    user: {...this.state.user, handUp: !this.state.user.handUp},
                    isHandUp: !this.state.isHandUp
                })
                localStorage.setItem('user', JSON.stringify({...this.state.user, handUp: !this.state.user.handUp}))
                this.sendMessage();
            });
    }

    signOut = () => {
        axios.post('http://localhost:8080/signOut', {
            username: this.state.username
        })
            .then(() => {
                this.sendMessage();
                localStorage.removeItem('user');
                history.replace('/login');
            });
    }

    render() {
        const {username, users, isHandUp, user, roles} = this.state;
        return (
            <div>
                <Navbar bg="primary">
                    <Navbar.Toggle/>
                    <Navbar.Collapse>
                        <Nav className="mr-auto">
                            <NavDropdown title='Actions'>
                                {roles.indexOf('STUDENT') !== -1 &&
                                <NavDropdown.Item onClick={this.handAction}>
                                    Raise hand
                                    {isHandUp ? ' down' : ' up'}
                                </NavDropdown.Item>
                                }
                                {roles.indexOf('TEACHER') !== -1 &&
                                <NavDropdown.Item href={'/students'}>
                                    Students list
                                </NavDropdown.Item>
                                }
                            </NavDropdown>
                        </Nav>
                        <Nav>
                            <NavDropdown title={username}>
                                <NavDropdown.Item onClick={this.signOut}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>

                <div className="members">

                    {users &&
                    <div>
                        <h5>Class members</h5>
                        <Table>
                            <tbody>
                            {users.map(user =>
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.handUp && <img src={hand} alt='hand'/>}</td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    </div>
                    }

                </div>

                <SockJsClient url='http://localhost:8080/classroom-ws/'
                              topics={['/topic/users']}
                              onConnect={() => {
                              }}
                              onDisconnect={() => {
                              }}
                              onMessage={(msg) => {
                                  this.setState({
                                      users: msg,
                                  })
                              }}
                              ref={(client) => {
                                  this.clientRef = client
                              }}/>
            </div>
        )
    }
}

export {Members}
