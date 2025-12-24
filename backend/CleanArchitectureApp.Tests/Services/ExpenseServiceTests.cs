using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Infrastructure.Services;
using CleanArchitectureApp.Domain.Entities;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Tests.Services
{
    public class ExpenseServiceTests
    {
        private readonly ExpenseService _expenseService;
        private readonly Mock<DbSet<Expense>> _mockExpenseSet;
        private readonly Mock<AppDbContext> _mockContext;

        public ExpenseServiceTests()
        {
            _mockExpenseSet = new Mock<DbSet<Expense>>();
            _mockContext = new Mock<AppDbContext>();
            _mockContext.Setup(c => c.Expenses).Returns(_mockExpenseSet.Object);

            _expenseService = new ExpenseService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddExpense()
        {
            // Arrange
            var createDto = new CreateExpenseDto("Test Expense", 100.0m, "Pending", "tenant1", "user1");

            // Act
            var result = await _expenseService.CreateAsync(createDto, "tenant1", "user1");

            // Assert
            _mockExpenseSet.Verify(e => e.Add(It.IsAny<Expense>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
            Assert.Equal("Test Expense", result.Name);
        }

        // Additional tests for GetAllAsync, GetByIdAsync, UpdateAsync, DeleteAsync
    }
}