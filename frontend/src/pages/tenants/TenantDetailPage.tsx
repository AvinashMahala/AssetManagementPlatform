import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenant, useDeleteTenant } from '../../hooks';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common';
import { ReceiptList } from '../../components/receipts';
import { getErrorMessage } from '../../types/api';

const TenantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, loading, error } = useTenant(id!);
  const { mutate: deleteTenant, loading: deleteLoading } = useDeleteTenant();

  const handleDelete = async () => {
    if (!tenant) return;
    if (window.confirm(`Are you sure you want to delete tenant ${tenant.firstName} ${tenant.lastName}?`)) {
      try {
        const response = await deleteTenant(id!);
        if (response.success) {
          navigate('/tenants');
        } else {
          alert('Failed to delete tenant: ' + (response.error?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Failed to delete tenant. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Not Found</h1>
          <Button onClick={() => navigate('/tenants')}>Back to List</Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{getErrorMessage(error) || 'Tenant not found'}</p>
          <Button onClick={() => navigate('/tenants')}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {tenant.firstName} {tenant.lastName}
        </h1>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => navigate('/tenants')}>
            Back to List
          </Button>
          <Button onClick={() => navigate(`/tenants/${id}/dashboard`)}>View Dashboard</Button>
          <Button onClick={() => navigate(`/tenants/${id}/edit`)}>Edit</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.phone || 'N/A'}</dd>
              </div>
              {tenant.alternatePhone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Alternate Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tenant.alternatePhone}</dd>
                </div>
              )}
              {tenant.dateOfBirth && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(tenant.dateOfBirth).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {tenant.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{tenant.gender}</dd>
                </div>
              )}
            </dl>
          </Card>

          {(tenant.occupation || tenant.companyName || tenant.monthlyIncome) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Information</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenant.occupation && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tenant.occupation}</dd>
                  </div>
                )}
                {tenant.companyName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tenant.companyName}</dd>
                  </div>
                )}
                {tenant.monthlyIncome && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Monthly Income</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ₹{tenant.monthlyIncome.toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Address</h2>
            <address className="not-italic text-sm text-gray-900">
              {tenant.currentAddress.street}
              <br />
              {tenant.currentAddress.city}, {tenant.currentAddress.state} {tenant.currentAddress.pincode}
            </address>
          </Card>

          {tenant.permanentAddress && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Permanent Address</h2>
              <address className="not-italic text-sm text-gray-900">
                {tenant.permanentAddress.street}
                <br />
                {tenant.permanentAddress.city}, {tenant.permanentAddress.state} {tenant.permanentAddress.pincode}
              </address>
            </Card>
          )}

          {tenant.emergencyContact && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tenant.emergencyContact.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tenant.emergencyContact.relationship}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tenant.emergencyContact.phone}</dd>
                </div>
              </dl>
            </Card>
          )}

          <ReceiptList tenantId={tenant.id} showHeader={true} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tenant.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : tenant.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
            </span>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(tenant.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailPage;
