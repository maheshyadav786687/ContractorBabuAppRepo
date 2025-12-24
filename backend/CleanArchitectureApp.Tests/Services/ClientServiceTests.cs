using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Infrastructure.Services;
using CleanArchitectureApp.Domain.Entities;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Tests.Services
{
    public class ClientServiceTests
    {
        private readonly ClientService _clientService;
        private readonly Mock<DbSet<Client>> _mockClientSet;
        private readonly Mock<AppDbContext> _mockContext;

        public ClientServiceTests()
        {
            _mockClientSet = new Mock<DbSet<Client>>();
            _mockContext = new Mock<AppDbContext>();
            _mockContext.Setup(c => c.Clients).Returns(_mockClientSet.Object);

            _clientService = new ClientService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddClient()
        {
            // Arrange
            var createDto = new CreateClientDto("Test Client", "John Doe", "test@example.com", "1234567890", null, null, null, null);

            // Act
            var result = await _clientService.CreateAsync(createDto, "tenant1", "user1");

            // Assert
            _mockClientSet.Verify(c => c.Add(It.IsAny<Client>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
            Assert.Equal("Test Client", result.Name);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllClients()
        {
            // Arrange
            var clients = new List<Client>
            {
                new Client { Id = 1, Name = "Client 1" },
                new Client { Id = 2, Name = "Client 2" }
            }.AsQueryable();

            _mockClientSet.As<IQueryable<Client>>().Setup(m => m.Provider).Returns(clients.Provider);
            _mockClientSet.As<IQueryable<Client>>().Setup(m => m.Expression).Returns(clients.Expression);
            _mockClientSet.As<IQueryable<Client>>().Setup(m => m.ElementType).Returns(clients.ElementType);
            _mockClientSet.As<IQueryable<Client>>().Setup(m => m.GetEnumerator()).Returns(clients.GetEnumerator());

            // Act
            var result = await _clientService.GetAllAsync();

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnClient_WhenClientExists()
        {
            // Arrange
            var client = new Client { Id = 1, Name = "Client 1" };
            _mockClientSet.Setup(c => c.FindAsync(1)).ReturnsAsync(client);

            // Act
            var result = await _clientService.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Client 1", result.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldModifyClient()
        {
            // Arrange
            var client = new Client { Id = 1, Name = "Client 1" };
            _mockClientSet.Setup(c => c.FindAsync(1)).ReturnsAsync(client);
            var updateDto = new UpdateClientDto("Updated Client", "John Doe", "john.doe@example.com", "0987654321", null, null, null, null);

            // Act
            await _clientService.UpdateAsync(1, updateDto);

            // Assert
            Assert.Equal("Updated Client", client.Name);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveClient()
        {
            // Arrange
            var client = new Client { Id = 1, Name = "Client 1" };
            _mockClientSet.Setup(c => c.FindAsync(1)).ReturnsAsync(client);

            // Act
            await _clientService.DeleteAsync(1);

            // Assert
            _mockClientSet.Verify(c => c.Remove(client), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
        }
    }
}