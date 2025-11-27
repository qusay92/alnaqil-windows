import { Payment, PaymentDetails, ResponseResult, SearchPayment } from '../models/models';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { appSettings } from 'src/appSettings/appSettings';



@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(private http: HttpClient, private router: Router) {}

  GetPayment(
    autoId: number
  ): Observable<ResponseResult<any>> {
    const url = appSettings.webApiUrl + 'api/Payments/GetPayment/' + autoId;
    return this.http.get<ResponseResult<any>>(url);
  }

  // Get payment status for all autos in curent page as one shot
  GetPaymentStatuses(autoIds: number[]): Observable<ResponseResult<{ [key: number]: { requiredAmount: number, debitAmount: number } }>> {
  const url = appSettings.webApiUrl + 'api/Payments/GetPaymentStatuses';
  return this.http.post<ResponseResult<{ [key: number]: { requiredAmount: number, debitAmount: number } }>>(url, autoIds);
}



  /*GetPayments(search: SearchPayment){
    let body = {
      isSearch: search.isSearch,
      autoId: search.autoId,
      vinNo: search.vinNo,
      purchaseDate: search.purchaseDate?.toString() == '' ? null : search.purchaseDate,
      clientId: search.clientId
    };

    const url = appSettings.webApiUrl + 'api/Payments/GetPayments';
    return this.http.post<ResponseResult<any>>(url, body);
  }*/

  // added code to get the data from the data base per page size
  GetPayments(search: SearchPayment, pageNumber: number, pageSize: number): Observable<ResponseResult<any>> {
  let body = {
    isSearch: search.isSearch,
    autoId: search.autoId,
    vinNo: search.vinNo,
    purchaseDate: search.purchaseDate?.toString() == '' ? null : search.purchaseDate,
    clientId: search.clientId,
    
    // ✅ Pagination params
    pageNumber: pageNumber,
    pageSize: pageSize
  };

  const url = appSettings.webApiUrl + 'api/Payments/GetPayments';
  return this.http.post<ResponseResult<any>>(url, body);
}

    
  // to get autoid based on vin number 
  // this add based on the change vinNo from list to text box
  getAutoIdByVin(vin: string): Observable<number> {
    console.log('Calling API with VIN:', vin);

    const url = appSettings.webApiUrl + 'api/Payments/GetAutoIdByVin';
    return this.http.get<number>(url, {
      params: { vin }
    });
  }

  SavePayment(model: Payment): Observable<ResponseResult<any>> {
    const url = appSettings.webApiUrl + 'api/Payments/SavePayment';
    return this.http.post<ResponseResult<any>>(url, model);
  }

  savePaymentDetails(model: PaymentDetails): Observable<ResponseResult<any>> {
    const url = appSettings.webApiUrl + 'api/Payments/savePaymentDetails';
    return this.http.post<ResponseResult<any>>(url, model);
  }

  Delete(model: PaymentDetails[]): Observable<ResponseResult<any>> {
    const url = appSettings.webApiUrl + 'api/Payments/Delete';
    return this.http.post<ResponseResult<any>>(url, model);
  }
}
