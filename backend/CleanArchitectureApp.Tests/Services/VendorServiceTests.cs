using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Infrastructure.Services;
using CleanArchitectureApp.Domain.Entities;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Tests.Services
{
    public class VendorServiceTests
    {
        private readonly VendorService _vendorService;
        private readonly Mock<DbSet<Vendor>> _mockVendorSet;
        private readonly Mock<AppDbContext> _mockContext;

        public VendorServiceTests()
        {
            _mockVendorSet = new Mock<DbSet<Vendor>>();
            _mockContext = new Mock<AppDbContext>();
            _mockContext.Setup(c => c.Vendors).Returns(_mockVendorSet.Object);

            _vendorService = new VendorService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddVendor()
        {
            // Arrange
            var createDto = new CreateVendorDto("Test Vendor", "John Doe", "test@example.com", "1234567890", null, null, null, null, null, null, null, null, null, null, "Supplier");

            // Act
            var result = await _vendorService.CreateAsync(createDto, "tenant1", "user1");

            // Assert
            _mockVendorSet.Verify(v => v.Add(It.IsAny<Vendor>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
            Assert.Equal("Test Vendor", result.Name);
        }

        // Additional tests for GetAllAsync, GetByIdAsync, UpdateAsync, DeleteAsync
    }
}