@ui @authentication
Feature: EventHub login
  As a registered EventHub user
  I want to authenticate through the web interface
  So that I can access the events platform

  Background:
    Given I am on the EventHub login page

  @smoke @login @positive
  Scenario: Sign in with valid credentials and validate the session through the API
    When I sign in with the configured valid credentials
    Then I should see the authenticated home page
    And the header should display the authenticated user's email
    And the JWT stored in localStorage should be valid according to GET /auth/me

  @smoke @login @negative
  Scenario: Reject an invalid password without creating a session
    When I sign in with the configured email and an invalid password
    Then I should see the invalid credentials error
    And I should remain on the login page
    And no JWT should be stored in localStorage
