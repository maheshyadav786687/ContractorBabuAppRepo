using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Infrastructure.Services;
using CleanArchitectureApp.Domain.Entities;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Tests.Services
{
    public class InvoiceServiceTests
    {
        private readonly InvoiceService _invoiceService;
        private readonly Mock<DbSet<Invoice>> _mockInvoiceSet;
        private readonly Mock<AppDbContext> _mockContext;

        public InvoiceServiceTests()
        {
            _mockInvoiceSet = new Mock<DbSet<Invoice>>();
            _mockContext = new Mock<AppDbContext>();
            _mockContext.Setup(c => c.Invoices).Returns(_mockInvoiceSet.Object);

            _invoiceService = new InvoiceService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddInvoice()
        {
            // Arrange
            var createDto = new CreateInvoiceDto("Test Invoice", 1000.0m, "Pending", "tenant1", "user1");

            // Act
            var result = await _invoiceService.CreateAsync(createDto, "tenant1", "user1");

            // Assert
            _mockInvoiceSet.Verify(i => i.Add(It.IsAny<Invoice>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
            Assert.Equal("Test Invoice", result.Name);
        }

        [Fact]
        public void GetAllAsync_ShouldReturnAllInvoices()
        {
            // Arrange
            var invoices = new List<Invoice>
            {
                new Invoice("Invoice 1", 500.0m, "Paid", "tenant1", "user1"),
                new Invoice("Invoice 2", 1500.0m, "Pending", "tenant1", "user1")
            };
            _mockInvoiceSet.As<IQueryable<Invoice>>().Setup(m => m.Provider).Returns(invoices.AsQueryable().Provider);
            _mockInvoiceSet.As<IQueryable<Invoice>>().Setup(m => m.Expression).Returns(invoices.AsQueryable().Expression);
            _mockInvoiceSet.As<IQueryable<Invoice>>().Setup(m => m.ElementType).Returns(invoices.AsQueryable().ElementType);
            _mockInvoiceSet.As<IQueryable<Invoice>>().Setup(m => m.GetEnumerator()).Returns(invoices.GetEnumerator());

            // Act
            var result = _invoiceService.GetAllAsync("tenant1", "user1");

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnInvoice()
        {
            // Arrange
            var invoice = new Invoice("Invoice 1", 500.0m, "Paid", "tenant1", "user1") { Id = 1 };
            _mockInvoiceSet.Setup(i => i.FindAsync(1)).ReturnsAsync(invoice);

            // Act
            var result = await _invoiceService.GetByIdAsync(1, "tenant1", "user1");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Invoice 1", result.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldModifyInvoice()
        {
            // Arrange
            var invoice = new Invoice("Invoice 1", 500.0m, "Paid", "tenant1", "user1") { Id = 1 };
            _mockInvoiceSet.Setup(i => i.FindAsync(1)).ReturnsAsync(invoice);
            var updateDto = new UpdateInvoiceDto("Updated Invoice", 750.0m, "Pending");

            // Act
            var result = await _invoiceService.UpdateAsync(1, updateDto, "tenant1", "user1");

            // Assert
            Assert.Equal("Updated Invoice", result.Name);
            Assert.Equal(750.0m, result.Amount);
            Assert.Equal("Pending", result.Status);
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveInvoice()
        {
            // Arrange
            var invoice = new Invoice("Invoice 1", 500.0m, "Paid", "tenant1", "user1") { Id = 1 };
            _mockInvoiceSet.Setup(i => i.FindAsync(1)).ReturnsAsync(invoice);

            // Act
            await _invoiceService.DeleteAsync(1, "tenant1", "user1");

            // Assert
            _mockInvoiceSet.Verify(i => i.Remove(It.IsAny<Invoice>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
        }
    }
}