namespace WebAPI.Interfaces
{
    public interface IPaymentService
    {
        Task<ResponseResult<object>> GetPayment(long autoId);
        Task<ResponseResult<object>> SavePaymentDetails(PaymentDetails model);
        Task<ResponseResult<object>> Delete(List<PaymentDetails> model);
       
        // Task<ResponseResult<object>> SavePayment(Payment model);
        Task<ResponseResult<object>> SavePayment(PaymentInput model, long UserId);
        Task<ResponseResult<object>> GetPayments(GetPaymentsInput input,long UserId);
        // to get autoid based on vin number 
        // this add based on the change vinNo from list to text box
        Task<long?> GetAutoIdByVin(string vin);

        // Get payment status for all autos in curent page as one shot
        Task<ResponseResult<Dictionary<long, PaymentStatusDto>>> GetPaymentStatusesAsync(List<long> autoIds);


    }
}
