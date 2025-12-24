using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Infrastructure.Services;
using CleanArchitectureApp.Domain.Entities;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Tests.Services
{
    public class ItemServiceTests
    {
        private readonly ItemService _itemService;
        private readonly Mock<DbSet<Item>> _mockItemSet;
        private readonly Mock<AppDbContext> _mockContext;

        public ItemServiceTests()
        {
            _mockItemSet = new Mock<DbSet<Item>>();
            _mockContext = new Mock<AppDbContext>();
            _mockContext.Setup(c => c.Items).Returns(_mockItemSet.Object);

            _itemService = new ItemService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddItem()
        {
            // Arrange
            var createDto = new CreateItemDto("Test Item", "Category", "Unit", 10.0m, 5.0m, 15.0m, 18.0m);

            // Act
            var result = await _itemService.CreateAsync(createDto, "tenant1", "user1");

            // Assert
            _mockItemSet.Verify(i => i.Add(It.IsAny<Item>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
            Assert.Equal("Test Item", result.Name);
        }

        // Additional tests for GetAllAsync, GetByIdAsync, UpdateAsync, DeleteAsync
    }
}