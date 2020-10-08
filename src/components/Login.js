import React from 'react';
import {Alert, Button, Form, Nav} from "react-bootstrap";
import SockJsClient from 'react-stomp';
import {history} from "../utils";
import * as axios from "axios";

class Login extends React.Component {
    constructor(props) {
        super(props);

        let userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        this.state = {
            username: '',
            error: '',
            user: userData,
            roles: ['STUDENT'],
        }
    }

    componentWillMount() {
        if (this.state.user)
            history.replace('/members');
    }


    handleChange = field => e => {
        this.setState({[field]: e.target.value});
        this.setState({error: ''})
    };

    handleSubmit = e => {
        e.preventDefault();

        axios.post('http://localhost:8080/signIn', {
            username: this.state.username,
            roles: this.state.roles,
            email: this.state.email
        })
            .then((response) => {
                localStorage.setItem('user', JSON.stringify(response.data));

                this.sendMessage();

                history.replace('/members')
            })
            .catch((err) => {
                this.setState({
                    error: err.response.data.message
                })
            });
    }

    sendMessage = () => {
        this.clientRef.sendMessage('/app/updateState');
    };

    render() {
        const {username, error} = this.state;
        return (
            <div className="screen-center">
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group>
                        <Nav fill variant="pills" defaultActiveKey="STUDENT"
                             onSelect={eventKey => this.setState({roles: [eventKey]})}>
                            <Nav.Item>
                                <Nav.Link eventKey='STUDENT'>Student</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='TEACHER'>Teacher</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={this.handleChange('username')}
                        />
                    </Form.Group>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Button variant="primary" type="submit" block className="form-btn">
                        Login
                    </Button>
                </Form>

                <SockJsClient url='http://localhost:8080/classroom-ws/'
                              topics={['/topic/users']}
                              onConnect={() => {
                              }}
                              onDisconnect={() => {
                              }}
                              onMessage={() => {
                              }}
                              ref={(client) => {
                                  this.clientRef = client
                              }}/>
            </div>
        )
    }
}

export {Login}
