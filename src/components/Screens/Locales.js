import React, { Component } from 'react';
import Local from "../Elements/Local";
import LocalCreate from "./LocalCreate";
import { Link, Switch, Route } from "react-router-dom";
import {getLocales, deleteLocal, saveDevice, deleteDevice} from '../../actions/apiFunctions';
import SweetAlert from 'sweetalert-react';
import { BeatLoader} from 'react-spinners';

class Locales extends Component {

    state = {
        subtitle: "Locales",
        store: {},
    }
    componentWillMount(){
        if (typeof this.props.location.state == 'undefined' || typeof this.props.location.state.store == 'undefined') {
            this.props.history.push("/");
            return;
        }
        this.setState({store: this.props.location.state.store});
    }
    render() {
        return (
            <div>
                <div className="row wrapper border-bottom white-bg page-heading">
                    <div className="col-lg-9">
                        <h2>Locales</h2>
                        <ol className="breadcrumb">
                            <li>
                                <Link to="/stores/locales">
                                    {this.state.store.name}
                                </Link>
                            </li>
                            <li className="active">
                                <strong>{this.state.subtitle}</strong>
                            </li>
                        </ol>
                    </div>
                </div>
                <div className="wrapper wrapper-content animated fadeInRight">
                    <Switch>
                        <Route path={`${this.props.match.path}/create`} render={props => <LocalCreate {...props} changeBreadcumb={this.changeBreadcumb} />} />
                        <Route exact path={this.props.match.path} render={props => <Listado {...props} store={this.state.store} changeBreadcumb={this.changeBreadcumb} />}/>
                    </Switch>
                </div>
            </div>
        );
    }

    changeBreadcumb = (subtitle) => subtitle != this.state.subtitle && this.setState({subtitle});
}

class Listado extends Component {
    state = {
        elements: [],
        alertShow: false,
        alertShow2: false,
        success: false,
        local_id: false,
        device_id: false,
        response: {},
        loading: true,
    }
    componentDidMount() {
        this.props.changeBreadcumb("Locales");
        getLocales(this.props.store._id, this.processResponse);
    }
    handleResponse = (success, response) => this.setState({alertShow2: true, success, response, local_id: false, device_id: false});
    handleDeleteRequest = local_id => this.setState({alertShow: true, local_id});
    handleCreateDeviceRequest = local_id => saveDevice(local_id, this.props.store._id, this.handleResponse);
    handleDeleteDeviceRequest = (local_id, device_id) => this.setState({alertShow: true, local_id, device_id});
    processResponse = elements => this.setState({elements, loading: false});
    
    render() {
        return (<div>
            <SweetAlert
                show= {this.state.alertShow}
                title= "SmartTotem"
                text= "¿Está seguro de que desea eliminar este elemento?"
                type= "warning"
                showCancelButton
                onConfirm= {() => {
                    this.setState({ alertShow: false, loading: true });
                    this.state.device_id ? deleteDevice(this.props.store._id, this.state.local_id, this.state.device_id, this.handleResponse) : deleteLocal(this.props.store._id, this.state.local_id, this.handleResponse);
                }}
                onCancel={() => this.setState({alertShow: false})}
            />
            <SweetAlert
                show= {this.state.alertShow2}
                title= "SmartTotem"
                text= {this.state.response.msg}
                type= {this.state.success ? "success" : "error"}
                onConfirm= {() => {
                    this.setState({ alertShow2: false });
                    this.state.success && getLocales(this.props.store._id, this.processResponse);
                }}
            />
            <div className='sweet-loading text-center'>
                <BeatLoader
                    sizeUnit={"px"} size={20} color={'#007EC7'}
                    loading={this.state.loading} />
            </div>
            {!this.state.loading && (
                <div>
                    <div className="text-right spaced">
                            <Link to={{pathname: "/stores/locales/create", state: {store_id: this.props.store._id}}}>
                            <button type="button" className="btn btn-w-m btn-success">Crear nuevo local</button>
                        </Link>
                    </div>
                    <div className="row">
                        {this.state.elements.length == 0 && (
                            <span className="spaced"><em>Aún no se han creado locales para el presente afiliado.</em></span>
                        )}
                        {this.state.elements.map(local => <Local local={local} key={local._id} handleDeleteRequest={this.handleDeleteRequest} handleCreateDeviceRequest={this.handleCreateDeviceRequest} handleDeleteDeviceRequest={this.handleDeleteDeviceRequest} />)}
                    </div>
                </div>
            )}
        </div>);
    }
}

export default Locales;