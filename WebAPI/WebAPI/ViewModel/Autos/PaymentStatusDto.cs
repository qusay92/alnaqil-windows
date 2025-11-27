namespace WebAPI.ViewModel.Autos
{
    public class PaymentStatusDto
    {
        public decimal RequiredAmount { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
    }

}
