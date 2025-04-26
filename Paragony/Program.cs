using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Paragony.Abstract;
using Paragony.Data;
using Paragony.Services;

try
{
    var builder = WebApplication.CreateBuilder(args);

// Add services to the container
    builder.Services.AddControllers()
        .AddJsonOptions(options => { options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

// Add DbContext
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services
    builder.Services.AddScoped<IReceiptService, ReceiptService>();
    builder.Services.AddScoped<IOpenAIService, OpenAiService>();
    builder.Services.AddScoped<IVoiceTranscriptionService, VoiceTranscriptionService>();
    builder.Services.AddScoped<ITextToVoiceService, TextToVoiceService>();
    builder.Services.AddScoped<ISemanticKernelService, SemanticKernelService>();

// Add CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAngularApp", builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });
    
    var app = builder.Build();
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(new
            {
                StatusCode = 500,
                Message = "An unexpected error occurred. Please try again later."
            });
        });
    });

    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        dbContext.Database.Migrate();
    }

// Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

//app.UseHttpsRedirection();
    app.UseCors("AllowAngularApp");
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    // Log the exception
    Console.WriteLine($"Application startup failed: {ex.Message}");
    Console.WriteLine(ex.StackTrace);

    // You could also use a logging framework here:
    // logger.LogError(ex, "Application startup failed");

    // Rethrow certain critical exceptions if needed
    throw;
}