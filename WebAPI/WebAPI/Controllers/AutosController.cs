using Entities;

namespace WebAPI.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AutosController : BaseController
    {
        public readonly IAutoService _repo;
        private readonly IStringLocalizer<AutosController> _localizerAutos;

        public AutosController(IConfiguration configuration, ILoggerService loggerService, IAutoService repo, IStringLocalizer<AutosController> localizerAutos) : base(configuration, loggerService)
        {
            _repo = repo;
            _localizerAutos = localizerAutos;
        }

        [HttpPost("SaveAuto")]
        public async Task<ResponseResult<List<Auto>>> SaveAuto([FromBody] SaveAutoInput model)
        {
            try
            {
                return await _repo.SaveAuto(model, UserId);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, model, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }

        }

        [HttpPost("GetAllByUser")]
        public async Task<ResponseResult<List<Auto>>> GetAllByUser([FromBody] AutoFilterParams param)
        {
            try
            {
                var result = await _repo.GetAllByUser(UserId, param, param.PageNumber, param.PageSize);
                return result;
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, param, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }

        }

        [HttpPost("DeleteAuto/{id}")]
        public async Task<ResponseResult<List<Auto>>> DeleteAuto(long id)
        {
            try
            {
                return await _repo.Delete(id);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, id, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }


        [HttpPost("DeleteAutos/{model}")]
        public async Task<ResponseResult<List<Auto>>> DeleteAutos(List<Auto> model)
        {
            try
            {
                return await _repo.DeleteAutos(model);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, model, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        [HttpPost("ArchiveAuto/{id}")]
        public async Task<ResponseResult<List<Auto>>> ArchiveAuto(long id)
        {
            try
            {
                return await _repo.Archive(id);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, id, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }


        [HttpPost("ArchiveAutos/{model}")]
        public async Task<ResponseResult<List<Auto>>> ArchiveAutos(List<Auto> model)
        {
            try
            {
                return await _repo.ArchiveAutos(model);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, model, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        [HttpPost("UnArchiveAutos/{model}")]
        public async Task<ResponseResult<List<Auto>>> UnArchiveAutos(List<Auto> model)
        {
            try
            {
                return await _repo.UnArchiveAutos(model);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, model, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        [HttpPost("DeleteImages/{id}")]
        public async Task<ResponseResult<List<Auto>>> DeleteImages(long id)
        {
            try
            {
                return await _repo.DeleteImages(id);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, id, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        [HttpGet("GetCarName")]
        public async Task<ResponseResult<List<AutoNameVM>>> GetCarName()
        {
            try
            {
                return await _repo.GetCarNameByUser(UserId);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, null, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }
        
        [HttpGet("GetClientNameByUser")]
        public async Task<ResponseResult<List<UserVM>>> GetClientNameByUser()
        {
            try
            {
                return await _repo.GetClientNameByUser(UserId);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, null, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
           
        }

        // New Added for Get Client Name from te DB
        [HttpGet("GetClientBuyerName")]
        public async Task<ResponseResult<List<ClientBuyerNameVM>>> GetClientBuyerName()
        {
            try
            {
                return await _repo.GetClientBuyerNameByUser(UserId); // Assuming UserId is provided
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, null, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        // New Added for Get Payment Status Values (Done Or Incomplete) from te DB
        [HttpGet("GetUpdatePaymentStatus")]
        public async Task<ResponseResult<List<UpdatePaymentStatusVM>>> GetUpdatePaymentStatus()
        {
            try
            {
                return await _repo.GetUpdatePaymentStatusByUser(UserId); // Assuming UserId is provided
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, null, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        // to get AutoId by VinNo
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


        [HttpGet("GetAutoById/{id}")]
        public async Task<ResponseResult<Auto>> GetAutoById(long id)
        {
            try
            {
                return await _repo.GetAutoById(id);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, id, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }


        [HttpGet("GetSideMenuByUser/{isArchive}")]
        public dynamic GetSideMenuByUser(byte isArchive)
        {
            try
            {
                return _repo.GetSideMenuByUser(UserId, isArchive);
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, isArchive, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }
        }

        [HttpPost("GetArchiveAllByUser")]
        public async Task<ResponseResult<List<Auto>>> GetArchiveAllByUser([FromBody] AutoFilterParams param)
        {
            try
            {
                var result = await _repo.GetArchiveAllByUser(UserId, param);
                return result;
            }
            catch (Exception ex)
            {
                _loggerService.LogError(ex, param, ControllerContext.ActionDescriptor.ControllerName, ControllerContext.ActionDescriptor.ActionName);
                return null;
            }

        }

    }
}
