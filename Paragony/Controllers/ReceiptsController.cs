using Microsoft.AspNetCore.Mvc;
using Paragony.Abstract;
using Paragony.Models;

namespace Paragony.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptsController(IReceiptService receiptService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Receipt>>> GetAllReceipts()
    {
        var receipts = await receiptService.GetAllReceipts();
        return Ok(receipts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Receipt>> GetReceiptById(Guid id)
    {
        var receipt = await receiptService.GetReceiptById(id);
            
        if (receipt == null)
            return NotFound();
                
        return Ok(receipt);
    }

    [HttpPost("upload")]
    public async Task<ActionResult<Receipt>> UploadReceipt([FromBody] ReceiptUploadDto uploadDto)
    {
        if (string.IsNullOrEmpty(uploadDto.Base64Image))
            return BadRequest("Image data is required");
                
        var receipt = await receiptService.AddReceiptFromImage(uploadDto.Base64Image);
        return CreatedAtAction(nameof(GetReceiptById), new { id = receipt.Id }, receipt);
    }

    public class ReceiptUploadDto
    {
        public string Base64Image { get; set; }
    }
}
