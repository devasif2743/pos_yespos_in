import axios from "axios";
// import Swal from "sweetalert2";
// http://192.168.29.83:8000/api/web-login
const api=axios.create({
   //  baseURL:'http://192.168.29.83:8000/api',
    baseURL:'http://127.0.0.1:8000/api',
    // baseURL:'https://api.nearbydoctors.in/public/api',
     headers: {
        //  "Content-Type": "application/json",
   
        },
})


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // check key name
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);




api.interceptors.response.use(
  (response) => response,
  (error) => {
  
    if (error.response?.status == 401) {
  
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_details");

    
      window.location.href = "/";

    }

    return Promise.reject(error);
  }
);




export const loginWeb= async (payload)=>{
     const response= await api.post('web-login',payload);
     return response;
}

export const addbrand= async (payload)=>{
     const response= await api.post('admin/add-brand',payload);
     return response;
}









































/////////////// Old Code

export const addCategorys= async (payload)=>{
     const response= await api.post('admin/add-category',payload);
     return response;
}
export const listCategories = async (id) => {
  const endpoint = id ? `admin/list-category/${id}` : 'admin/list-category';
  const response = await api.get(endpoint);
  return response;
};


export const updateCategorys = async (id, payload) => {
  const response = await api.put(`admin/update-category/${id}`, payload);
  return response.data;
};


export const deleteCategorys = async (id) => {
  const response = await api.delete(`admin/delete-category/${id}`);
  return response;
};


export const addNewGame= async (payload)=>{
     const response= await api.post('admin/add-game',payload);
     return response;
}

export const listGames = async (id) => {
  const endpoint = id ? `admin/list-game/${id}` : 'admin/list-game';
  const response = await api.get(endpoint);
  return response;
};



export const updategames = async (id, payload) => {
  const response = await api.put(`admin/update-game/${id}`, payload);
  return response.data;
};


export const deletegames = async (id) => {
  const response = await api.delete(`admin/delete-game/${id}`);
  return response;
};

// products
export const addNewProduct= async (payload)=>{
     const response= await api.post('admin/add-product',payload);
     return response;
}

export const listProducts = async (id) => {
  const endpoint = id ? `admin/list-product/${id}` : 'admin/list-product';
  const response = await api.get(endpoint);
  return response;
};



export const updateProducts = async (id, payload) => {
  const response = await api.put(`admin/update-product/${id}`, payload);
  return response.data;
};


export const deleteProducts = async (id) => {
  const response = await api.delete(`admin/delete-product/${id}`);
  return response;
};


export const dashboardList = async (id) => {
  const endpoint = id ? `admin/dashboard/${id}` : 'admin/dashboard';
  const response = await api.get(endpoint);
  return response;
};


// dashboard
// order



export const addNewOrder= async (payload)=>{
     const response= await api.post('admin/add-order',payload);
     return response;
}



export const orderList = async (id) => {
  const endpoint = id ? `admin/list-orders/${id}` : 'admin/list-orders';
  const response = await api.get(endpoint);
  return response;
};

export const updateOrderNewStatus = async (id, payload) => {
  const response = await api.put(`admin/update-order/${id}`, payload);
  return response.data;
};















export const customer_store= async (payload)=>{
     const response= await api.post('admin/add-customer',payload);
     return response;
}



export const list_customers= async ()=>{
     const response= await api.get('admin/list-customer');
     return response;
}



export const list_project_by_customer_id=async(id)=>{
    const response= await api.get(`admin/list-project-by-customer-id/${id}`);
     return response;
}

export const delete_customer= async (id)=>{
     const response= await api.delete(`admin/delete-customer/${id}`);
     return response;
}

export const list_customer= async (id)=>{
     const response= await api.get(`admin/list-customer/${id}`);
     return response;
} 

export function customer_update(payload) {


   return api.put(`admin/customer-update/${payload.id}`, payload);
}

export function add_project(payload) {

   return api.post('admin/add-project', payload);
}
export const list_projects= async ()=>{
     const response= await api.get('admin/list-project');
     return response;
}

export const list_project= async (id)=>{
 
     const response= await api.get(`admin/list-project/${id}`);
     return response;
}

export function update_stage(payload) {
   return api.put(`admin/projects-domain-update/${payload.id}`, payload);
}


export function update_hosting_stage(payload) {
   return api.put(`admin/projects-hosting-update/${payload.id}`, payload);
}

export function update_design_stage(payload) {
   return api.put(`admin/projects-design-update/${payload.id}`, payload);
}

export function update_live_stage(payload) {
   return api.put(`admin/projects-live-update/${payload.id}`, payload);
}

export function update_balance_stage(payload) {
   return api.put(`admin/projects-balance-update/${payload.id}`, payload);
}


export function update_stage_update(payload) {
   return api.put(`admin/projects-stage-update/${payload.id}`, payload);
}


export function update_document(payload) {
   return api.post(`admin/project-document`, payload);
}

export const delete_document= async (id)=>{
     const response= await api.delete(`admin/project-document-delete/${id}`);
     return response;
}

export const get_all_salesTeam= async (id)=>{
     const response= await api.get('admin/list-staff');
     return response;
}

export function update_project(formData) {
   return api.post(`admin/project-update`, formData);
}


export function create_staff(payload){
   return api.post('admin/create-staff',payload);
}

export function get_all_staffs(){
   return api.get(`admin/all-staff`);
}

export function get_all_staff(id){
   return api.get(`admin/all-staff/${id}`);
}

export function update_staff(payload){
   return api.post('admin/update-staff',payload);
}

export function delete_staff(payload){
   return api.delete(`admin/delete-staff/${payload}`);
}

export function create_task(payload){
   return api.post('admin/create-task',payload);
}

export function list_all_calender(){
   return api.get('admin/list-all-calender');
}

export function create_meeting(payload){
   return api.post('admin/create-meeting',payload);
}

export function create_invoice(payload){
   return api.post('admin/create-invoice',payload);
}


export function list_invoice(){
   return api.get('admin/list-invoice');
}

export function list_invoice_id(id){
   return api.get(`admin/list-invoice/${id}`);
}


export function list_invoice_ids(id){
   return api.get(`admin/list-invoices/${id}`);
}


export function create_payment(formData) {

  return api.post('admin/create-payment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function invoices_update(id,payload){
   return api.put(`admin/invoices-update/${id}`,payload);
}


export function create_expanses(payload){
   return api.post('admin/create-expanses',payload);
}

export function list_expanses(){
   return api.get('admin/list-expanses');
}

export function analyticss(){
   return api.get('admin/analytics');
}

export function getOverview(){
   return api.get('admin/getOverview');
}

export function project_status_update(payload){
   return api.post('admin/project-status-update',payload);
}




export function update_expense(id, payload) {
  return api.post(`admin/update-expanses/${id}`, payload);
}

export function delete_expanses(id) {
  return api.delete(`admin/delete-expanses/${id}`);
}



//delete-expanses







// below for chat integration
export function Incomingmessages(){
   return api.get('admin/messages');
}

export const getMessagesBetweenUsers = (userId) =>
  api.get(`admin/messages?user_id=${userId}`);


export function sentMessage(payload){
   return api.post('admin/messages',payload);
}



//Incomingmessages
//   api.get('/messages').then(res => setMessages(res.data));

//project-status-update




//list-expanses

//create-expanses
//invoices-update
//create-invoice
//create-meeting
//list-all-calender
//create-task

//delete-staff

//update-staff
//update_project
// rojects-stage-update





    // Route::put('/projects-hosting-update/{id}',      [ProjectController::class, 'updateHosting']);
    // Route::put('/projects-design-update/{id}',      [ProjectController::class, 'updateDesign']);
    // Route::put('/projects-live-update/{id}',      [ProjectController::class, 'updateMadeLive']);
    // Route::put('/projects-balance-update/{id}',      [ProjectController::class, 'updateBalanceAsked']);




export default api;