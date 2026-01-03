using System;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using MyApp.Api.Swagger;
using Xunit;

namespace MyApp.Tests.Unit
{
    public class ExternalDocsOperationFilterTests
    {
        class FakeEnv : IWebHostEnvironment
        {
            public string EnvironmentName { get; set; } = "UnitTest";
            public string ApplicationName { get; set; } = "MyApp.Api";
            public string WebRootPath { get; set; } = string.Empty;
            public Microsoft.Extensions.FileProviders.IFileProvider WebRootFileProvider { get; set; }
            public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
            public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; }
        }

        private static void InvokeApplyParameterExamplesFromJson(ExternalDocsOperationFilter filter, string json, OpenApiOperation op)
        {
            using var doc = JsonDocument.Parse(json);
            var mi = typeof(ExternalDocsOperationFilter).GetMethod("ApplyParameterExamplesFromJson", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            Assert.NotNull(mi);
            mi.Invoke(filter, new object[] { doc.RootElement, op });
        }

        [Fact]
        public void CanonicalParameters_AttachesExampleToExistingParam()
        {
            var filter = new ExternalDocsOperationFilter(new FakeEnv());
            var op = new OpenApiOperation();
            op.Parameters.Add(new OpenApiParameter { Name = "id", In = ParameterLocation.Path, Required = true, Schema = new OpenApiSchema { Type = "string" } });

            var json = @"{ " +
                        "\"parameters\": { \"path\": { \"id\": { \"example\": \"00000000-0000-0000-0000-000000000000\" } } } }";

            InvokeApplyParameterExamplesFromJson(filter, json, op);

            var p = Assert.Single(op.Parameters, x => x.Name == "id");
            Assert.IsType<OpenApiString>(p.Example);
            Assert.IsType<OpenApiString>(p.Schema.Example);
        }

        [Fact]
        public void ShortForm_WithIn_CreatesParameterAndSetsExample()
        {
            var filter = new ExternalDocsOperationFilter(new FakeEnv());
            var op = new OpenApiOperation();

            var json = "{ \"id\": { \"in\": \"path\", \"example\": \"1111\" } }";
            InvokeApplyParameterExamplesFromJson(filter, json, op);

            var p = Assert.Single(op.Parameters, x => x.Name == "id");
            Assert.Equal(ParameterLocation.Path, p.In);
            Assert.IsType<OpenApiString>(p.Example);
            Assert.IsType<OpenApiString>(p.Schema.Example);
        }

        [Fact]
        public void ShortForm_NoIn_AttachesToExistingParam()
        {
            var filter = new ExternalDocsOperationFilter(new FakeEnv());
            var op = new OpenApiOperation();
            op.Parameters.Add(new OpenApiParameter { Name = "id", In = ParameterLocation.Path, Required = true, Schema = new OpenApiSchema { Type = "string" } });

            var json = "{ \"id\": { \"example\": \"2222\" } }";
            InvokeApplyParameterExamplesFromJson(filter, json, op);

            var p = Assert.Single(op.Parameters, x => x.Name == "id");
            Assert.IsType<OpenApiString>(p.Example);
            Assert.IsType<OpenApiString>(p.Schema.Example);
        }

        [Fact]
        public void NamedExamples_AreAddedAsExtensions()
        {
            var filter = new ExternalDocsOperationFilter(new FakeEnv());
            var op = new OpenApiOperation();

            var json = "{ \"id\": { \"in\": \"path\", \"examples\": { \"default\": { \"value\": \"abc\" }, \"other\": { \"value\": \"def\" } } } }";
            InvokeApplyParameterExamplesFromJson(filter, json, op);

            var p = Assert.Single(op.Parameters, x => x.Name == "id");
            Assert.Contains("x-example-default", p.Extensions.Keys);
            Assert.Contains("x-example-other", p.Extensions.Keys);
        }
    }
}
