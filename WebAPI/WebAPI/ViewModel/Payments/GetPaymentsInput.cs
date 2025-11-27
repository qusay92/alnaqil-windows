namespace WebAPI.ViewModel.Payments
{
    public class GetPaymentsInput
    {
        public bool IsSearch { get; set; }
        public int? AutoId { get; set; }
        public string VinNo { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public int? ClientId { get; set; }

        // added code to get the data from the data base per page size
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }
}
