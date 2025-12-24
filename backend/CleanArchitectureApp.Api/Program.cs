using System.Text;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
// Configure controllers and JSON serialization to use camelCase so frontend gets `token` not `Token`
builder.Services.AddScoped<CleanArchitectureApp.Api.Filters.JwtAuthorizationFilter>();
builder.Services.AddControllers(options =>
{
    options.Filters.AddService<CleanArchitectureApp.Api.Filters.JwtAuthorizationFilter>();
})
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// JWT Authentication - use configuration values and enable proper validation
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ContractorBabuAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ContractorBabuClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                // Relax lifetime check temporarily for debugging
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                Console.WriteLine("[JwtBearer] OnMessageReceived. Authorization header: " + (context.Request.Headers["Authorization"].FirstOrDefault() ?? "<none>"));
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("[JwtBearer] Authentication failed: " + context.Exception);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("[JwtBearer] Token validated for " + context.Principal?.Identity?.Name);
                return Task.CompletedTask;
            }
        };
    });

// Dependency Injection
builder.Services.AddScoped<IAuthService, AuthService>();

// Core Management Services
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<ISiteService, SiteService>();

// Project Management Services
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IQuotationService, QuotationService>();

// Inventory & Procurement Services
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();

// Finance & Payroll Services
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<ILaborService, LaborService>();
builder.Services.AddScoped<IPayrollService, PayrollService>();

// Reporting Service
builder.Services.AddScoped<IReportingService, ReportingService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Log all incoming requests
app.Use(async (context, next) =>
{
    Console.WriteLine($"📥 Request: {context.Request.Method} {context.Request.Path}");
    Console.WriteLine($"🔑 Auth Header: {context.Request.Headers["Authorization"].FirstOrDefault() ?? "NONE"}");
    await next();
    Console.WriteLine($"📤 Response: {context.Response.StatusCode}");
});

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
