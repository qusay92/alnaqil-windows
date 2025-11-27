using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Utilities.Enums.Enum;

namespace Utilities
{
    public class ResponseResult<T>
    {
        public T Data { get; set; }
        public StatusType Status { get; set; }
        public List<string> Errors { get; set; }
        // added code to get the data from the data base per page size
        public int TotalRecords { get; set; }

        // added code to get the data from the data base per page size
        // These default values only apply if Angular doesn’t send values
        public int PageNumber { get; set; } = 1;
        // added code to get the data from the data base per page size
        // These default values only apply if Angular doesn’t send values
        public int PageSize { get; set; } = 50;


    }
}
