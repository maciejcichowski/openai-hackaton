using Microsoft.AspNetCore.Mvc;
using Paragony.Abstract;
using Paragony.Models;

namespace Paragony.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptsController(IReceiptService receiptService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Receipt>>> GetAllReceipts([FromQuery] DateOnly? dateFrom, [FromQuery] DateOnly? dateTo)
    {
        var receipts = await receiptService.GetAllReceipts(dateFrom, dateTo);;
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

    [HttpGet("{id}/image")]
    public async Task<IActionResult> DownloadReceiptImage(Guid id)
    {
        var receipt = await receiptService.GetReceiptById(id);

        if (receipt == null || string.IsNullOrEmpty(receipt.ImagePath))
            return NotFound("Receipt or image not found.");

        var imagePath = Path.Combine("Uploads", receipt.ImagePath);

        if (!System.IO.File.Exists(imagePath))
            return NotFound("Image file not found.");

        var imageBytes = await System.IO.File.ReadAllBytesAsync(imagePath);
        return File(imageBytes, "image/jpeg", receipt.ImagePath);
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
