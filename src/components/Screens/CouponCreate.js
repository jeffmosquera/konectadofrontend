import React, { Component } from 'react';
import { saveCoupon, getProducts, getBillboards, getLocales, getMembers } from '../../actions/apiFunctions';
import SweetAlert from 'sweetalert-react';
import { Alert } from 'reactstrap';
import DatePicker from "react-datepicker";
import { BeatLoader} from 'react-spinners';

class CouponCreate extends Component {

    state = {
        coupon_id: false,
        store_id: 0,
        product_id: 0,
        start: new Date(),
        end: new Date(),
        counter_max: 0,
        discount: 0,
        start_time: 0,
        end_time: 24,
        hours: 24,
        hours1: 1,
        hours2: 0,
        is_promo: "false",
        products: [],
        billboards: [],
        locales: [],
        members: [],
        selected_billboards: new Set(),
        selected_locales: new Set(),
        selected_members: new Set(),
        today: new Date(),
        errmessage: "",

        response: {},
        success: false,
        alertShow: false,
        alertShow2: false,
        loading: true,
    }

    handleStart = start  => this.setState({start});
    handleEnd = end => this.setState({end});
    handleCounterMax = event => this.setState({counter_max: event.target.value});
    handleDiscount = event => this.setState({discount: event.target.value});
    handleProduct = event => this.setState({product_id: event.target.value});
    handleStartTime = event => this.setState({start_time: event.target.value});
    handleEndTime = event => this.setState({end_time: event.target.value});
    handleOptionChange = event => this.setState({is_promo: event.target.value == "opt1"});
    handleHours1 = event => {
        let valor = event.target.value;
        let hours = valor * 24 + parseInt(this.state.hours2);
        this.setState({hours: hours, hours1: Math.floor(hours / 24), hours2: hours % 24});
    }
    handleHours2 = event => {
        let valor = event.target.value;
        let hours = parseInt(valor) + (this.state.hours1 * 24);
        this.setState({hours: hours, hours1: Math.floor(hours / 24), hours2: hours % 24});
    }
    handleCheckBillboard = event => {
        const target = event.target;
        const newSet  = this.state.selected_billboards;
        target.checked ? newSet.add(target.id) : newSet.delete(target.id);
        this.setState({selected_billboards: newSet});
    }
    handleCheckLocal = event => {
        const target = event.target;
        const newSet  = this.state.selected_locales;
        target.checked ? newSet.add(target.id) : newSet.delete(target.id);
        this.setState({selected_locales: newSet});
    }
    handleCheckMember = event => {
        const target = event.target;
        const newSet  = this.state.selected_members;
        target.checked ? newSet.add(target.id) : newSet.delete(target.id);
        this.setState({selected_members: newSet});
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.state.product_id == "0")
            this.setState({alertShow2: true, errmessage: "¡Debe elegir un producto para guardar el cupón!"});
        else if (this.state.selected_locales.size == 0) {
            this.setState({alertShow2: true, errmessage: "¡Debe elegir al menos un local!"});
        } else {
            let start = this.state.start;
            let dd = start.getDate() < 10 ? ('0' + start.getDate()) : start.getDate();
            let mm = start.getMonth() + 1;
            mm < 10 && (mm = '0' + mm);
            start = dd + '/' + mm + '/' + start.getFullYear();
            
            let end = this.state.end;
            dd = end.getDate() < 10 ? ('0' + end.getDate()) : end.getDate();
            mm = end.getMonth() + 1;
            mm < 10 && (mm = '0' + mm);
            end = dd + '/' + mm + '/' + end.getFullYear();

            this.setState({loading: true});
            saveCoupon(this.state.coupon_id, this.state.store_id, this.state.product_id, start, end, this.state.counter_max, this.state.discount, this.state.start_time, this.state.end_time, (this.state.selected_billboards.size > 0 || this.state.selected_members > 0) ? false : this.state.is_promo, this.state.hours, Array.from(this.state.selected_billboards).join(), Array.from(this.state.selected_locales).join(), Array.from(this.state.selected_members).join(), this.handleResponse);
        }
    }
    handleResponse = (success, response) => {
        this.setState({loading: false, alertShow: true, success, response});
        this.prepareForm();
    }
    handleProductsResponse = products => {
        this.setState({products});
        this.state.coupon_id && this.setState({product_id: this.props.location.state.coupon.product._id});
        getBillboards("", this.handleBillboardsResponse);
    }
    handleBillboardsResponse = billboards => {
        this.setState({billboards});
        getLocales(this.state.store_id, this.handleLocalesResponse);
    }
    handleLocalesResponse = locales => {
        this.setState({locales, loading: false});
        getMembers(this.handleMembersResponse);
    }
    handleMembersResponse = members => {
        this.setState({members, loading: false});
        this.prepareForm();
    }
    handleCheckLocalAll = event => {
        const target = event.target;
        const newSet = new Set();
        if (target.checked) {
            for (let local of this.state.locales)
                newSet.add(local._id);
        }
        this.setState({selected_locales: newSet});
    }

    prepareForm = () => {
        const $ = require('jquery');
        this.props.changeBreadcumb(this.state.coupon_id ? "Editar cupón" : "Crear cupón");
        $("input[type=number]").focus(function(){
            $(this).parent().addClass("is-focused");
            $(this).parent().removeClass("is-filled");
         
        }).blur(function(){
            $(this).val() !== "" && $(this).parent().addClass("is-filled");
            $(this).parent().removeClass("is-focused");
        });
        this.state.counter_max !== "" && $("#counter_max").parent().addClass("is-filled");
        this.state.discount !== "" && $("#discount").parent().addClass("is-filled");
        this.state.start_time !== "" && $("#start_time").parent().addClass("is-filled");
        this.state.end_time !== "" && $("#end_time").parent().addClass("is-filled");
        this.state.hours !== "" && $("#hours1").parent().addClass("is-filled");
        this.state.hours !== "" && $("#hours2").parent().addClass("is-filled");
    }
    componentWillMount() {
        if (typeof this.props.location.state == 'undefined') {
            this.props.history.push("/");
            return;
        }
        const coupon = this.props.location.state.coupon;
        if (typeof coupon != 'undefined') {
            const start = new Date([...coupon.start.split("/").reverse()]);
            const end = new Date([...coupon.end.split("/").reverse()]);
            const billboards = new Set();
            for (let billboard of coupon.billboards)
                billboards.add(billboard._id);
            const locales = new Set();
            for (let local of coupon.locals)
                locales.add(local._id);
            const members = new Set();
            for (let member of coupon.members)
                members.add(member._id);
            this.setState({
                coupon_id: coupon._id,
                store_id: coupon.store_id,
                start, end,
                counter_max: coupon.counter_max,
                discount: coupon.discount,
                start_time: coupon.start_time,
                end_time: coupon.end_time,
                is_promo: coupon.is_promo,
                hours: coupon.hours,
                hours1: Math.floor(coupon.hours / 24),
                hours2: coupon.hours % 24,
                selected_billboards: billboards,
                selected_locales: locales,
                selected_members: members,
            });
            getProducts(coupon.store_id, this.handleProductsResponse);
        } else {
            this.setState({store_id: this.props.location.state.store_id});
            getProducts(this.props.location.state.store_id, this.handleProductsResponse);
        }
    }

    render() {
        return (
            <div>
                <SweetAlert
                    show= {this.state.alertShow}
                    title= "SmartTotem"
                    text= {this.state.response.msg}
                    type= {this.state.success ? "success" : "error"}
                    onConfirm= {() => {
                        this.setState({ alertShow: false });
                        this.state.success && this.props.history.goBack();
                    }}
                />
                <Alert fade={false} color="danger" isOpen={this.state.alertShow2} toggle={() => this.setState({  alertShow2: false })}>{this.state.errmessage}</Alert>
                <div className='sweet-loading text-center'>
                    <BeatLoader
                        sizeUnit={"px"} size={20} color={'#007EC7'}
                        loading={this.state.loading} />
                </div>
                {!this.state.loading && (
                    <form onSubmit={this.handleSubmit}>
                        <div className="row">
                            <div className="form-group bmd-form-group col-sm-4">
                                <label className="margined-right">Inicio:</label>
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    minTime={this.state.today}
                                    selected={this.state.start}
                                    onChange={this.handleStart} />
                            </div>
                            <div className="form-group bmd-form-group col-sm-4">
                                <label className="margined-right">Final:</label>
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    minTime={this.state.today}
                                    selected={this.state.end}
                                    onChange={this.handleEnd} />
                            </div>
                            <div className="form-group bmd-form-group col-sm-4">
                                <div className="radio">
                                    <label>
                                        <input type="radio" value="opt1" 
                                            checked={this.state.is_promo == true} 
                                            onChange={this.handleOptionChange} />
                                        Mostrar en home
                                    </label>
                                    </div>
                                    <div className="radio">
                                    <label>
                                        <input type="radio" value="opt2" 
                                            checked={this.state.is_promo == false} 
                                            onChange={this.handleOptionChange} />
                                        No mostrar en home
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group bmd-form-group col-sm-6 col-md-3">
                                <label htmlFor="counter_max" className="bmd-label-floating"> Máximos usos</label>
                                <input min="0" step="1" required type="number" className="form-control" onChange={this.handleCounterMax} id="counter_max" value={this.state.counter_max} />
                            </div>
                            <div className="form-group bmd-form-group col-sm-6 col-md-3">
                                <label htmlFor="discount" className="bmd-label-floating"> Descuento</label>
                                <input min="0" step="1" required type="number" className="form-control" onChange={this.handleDiscount} id="discount" value={this.state.discount} />
                            </div>
                            <div className="form-group bmd-form-group col-sm-6 col-md-3">
                                <label htmlFor="start_time" className="bmd-label-floating"> Hora inicio</label>
                                <input min="0" step="1" required type="number" className="form-control" onChange={this.handleStartTime} id="start_time" value={this.state.start_time} />
                            </div>
                            <div className="form-group bmd-form-group col-sm-6 col-md-3">
                                <label htmlFor="end_time" className="bmd-label-floating"> Hora final</label>
                                <input min="0" step="1" required type="number" className="form-control" onChange={this.handleEndTime} id="end_time" value={this.state.end_time} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group bmd-form-group col-sm-12 col-md-6">
                                <select className="form-control" value={this.state.product_id} onChange={this.handleProduct} >
                                    <option value="0">Elija el producto</option>
                                    {this.state.products.map(product => <option key={product._id} value={product._id}>{product.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group bmd-form-group col-sm-6 col-md-3">
                                <label htmlFor="hours1" className="bmd-label-floating"> Bloqueo (días)</label>
                                <input min="0" step="1" required type="number" className="form-control" onChange={this.handleHours1} max="100" id="hours1" value={this.state.hours1} />
                            </div>
                            <div className="form-group bmd-form-group col-sm-6 col-md-3">
                                <label htmlFor="hours2" className="bmd-label-floating"> Bloqueo (horas)</label>
                                <input min="0" step="1" required type="number" className="form-control" onChange={this.handleHours2} max="23" id="hours2" value={this.state.hours2} />
                            </div>
                        </div>
                        <div className="sspaced" />
                        <div className="row">
                            <h3>Locales</h3>
                            {this.state.locales.length == 0 && (
                                <em>No se han creado locales.</em>
                            )}
                            {this.state.locales.length > 0 && (
                                <div className="form-check col-sm-6 col-md-4">
                                    <input className="form-check-input" type="checkbox" id="todos" onChange={this.handleCheckLocalAll} />
                                    <label className="form-check-label" htmlFor="todos">
                                        Elegir todos
                                    </label>
                                </div>
                            )}
                            {this.state.locales.map(local =>
                                <div className="form-check col-sm-6 col-md-4" key={local._id}>
                                    <input className="form-check-input" type="checkbox" id={local._id} onChange={this.handleCheckLocal} checked={this.state.selected_locales.has(local._id)} />
                                    <label className="form-check-label" htmlFor={local._id}>
                                        {local.name}
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="sspaced" />
                        <div className="row">
                            <h3>Tótems</h3>
                            {this.state.billboards.length == 0 && (
                                <em>No se han creado tótems.</em>
                            )}
                            {this.state.billboards.map(billboard =>
                                <div className="form-check col-sm-6 col-md-4" key={billboard._id}>
                                    <input className="form-check-input" type="checkbox" id={billboard._id} onChange={this.handleCheckBillboard} checked={this.state.selected_billboards.has(billboard._id)} />
                                    <label className="form-check-label" htmlFor={billboard._id}>
                                        {billboard.address}
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="row">
                            <h3>Socios</h3>
                            {this.state.members.length == 0 && (
                                <em>No se han creado socios.</em>
                            )}
                            {this.state.members.map(member =>
                                <div className="form-check col-sm-6 col-md-4" key={member._id}>
                                    <input className="form-check-input" type="checkbox" id={member._id} onChange={this.handleCheckMember} checked={this.state.selected_members.has(member._id)} />
                                    <label className="form-check-label" htmlFor={member._id}>
                                        {member.name}
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="wrapper-content">
                            <button type="submit" className="btn btn-w-m btn-success">Guardar</button>
                        </div>
                    </form>
                )}
            </div>
        );
    }
}
export default CouponCreate;