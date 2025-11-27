using Entities;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : BaseController
    {
        public readonly IPaymentService _repo;
        private readonly IStringLocalizer<PaymentsController> _localizerPayments;

        public PaymentsController(IConfiguration configuration, ILoggerService loggerService, IPaymentService repo, IStringLocalizer<PaymentsController> localizerPayments) : base(configuration, loggerService)
        {
            _repo = repo;
            _localizerPayments = localizerPayments;
        }

        // Get payment status for all autos in curent page as one shot
        [HttpPost("GetPaymentStatuses")]
        public async Task<IActionResult> GetPaymentStatuses([FromBody] List<long> autoIds)
        {
            var result = await _repo.GetPaymentStatusesAsync(autoIds);
            return Ok(result);
        }


        [HttpGet("GetPayment/{autoId}")]
        public async Task<ResponseResult<object>> GetPayment(long autoId)
        {
            try
            {
                return await _repo.GetPayment(autoId);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, autoId, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        [HttpPost("GetPayments")]
        public async Task<ResponseResult<object>> GetPayments([FromBody] GetPaymentsInput input)
        {
            try
            {
                return await _repo.GetPayments(input, UserId);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, input, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        // to get autoid based on vin number 
        // this add based on the change vinNo from list to text box
        [HttpGet("GetAutoIdByVin")]
        public async Task<IActionResult> GetAutoIdByVin([FromQuery] string vin) // Changed from [FromBody] to [FromQuery]
        {
            try
            {
                if (string.IsNullOrWhiteSpace(vin))
                {
                    return BadRequest("VIN number is required");
                }

                var autoId = await _repo.GetAutoIdByVin(vin);

                if (!autoId.HasValue)
                {
                    return NotFound("Vehicle with this VIN number not found");
                }

                return Ok(autoId.Value);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, vin, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }


        [HttpPost("SavePayment")]
        public async Task<ResponseResult<object>> SavePayment([FromBody] PaymentInput model)
        {
            try
            {
                return await _repo.SavePayment(model, UserId);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, model, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        [HttpPost("SavePaymentDetails")]
        public async Task<ResponseResult<object>> SavePaymentDetails([FromBody] PaymentDetails model)
        {
            try
            {
                return await _repo.SavePaymentDetails(model);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, model, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
           
        }

        [HttpPost("Delete")]
        public async Task<ResponseResult<object>> Delete([FromBody] List<PaymentDetails> model)
        {
            try
            {
                return await _repo.Delete(model);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, model, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
          
        }


    }
}
