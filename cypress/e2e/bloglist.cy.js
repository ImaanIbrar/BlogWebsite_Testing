describe('Blog app', function () {
  beforeEach(function () {
    //cy.request('POST', `${Cypress.env('BACKEND')}`)

    const user = {
      name: 'Abdullah Tahir',
      username: 'ab123',
      password: 'secret',
    }

    const otherUser = {
      name: 'Marriam Naeem',
      username: 'ma123',
      password: 'salainen',
    }

    //cy.request('POST', `${Cypress.env('BACKEND')}/users/`, user)
    //cy.request('POST', `${Cypress.env('BACKEND')}/users/`, otherUser)
    cy.visit('')
  })

  it('login form is shown', function () {
    cy.contains(/sign in/i)
  })

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.get('#username').type('ab123')
      cy.get('#password').type('secret')
      cy.get('button').click()

      cy.contains('Abdullah Tahir logged in')
    })

    it('fails with wrong credentials', function () {
      cy.get('#username').type('Imaan890')
      cy.get('#password').type('wrong')
      cy.get('button').click()

      cy.contains(/wrong credentials/i)
    })
  })

  describe('When logged in', function () {
    beforeEach(function () {
   cy.login({ username: 'ab123', password: 'secret' })
    })

    it('a blog can be created', function () {
      cy.contains('new blog').click()
      cy.get('input[name="Title"]').type('End to End testing with Cypress')
      cy.get('input[name="Author"]').type('Gonzalo Coradello')
      cy.get('input[name="Url"]').type('http://localhost:3001/blogs/663f9a2c542e5f8e7029f260')
      cy.contains('create').click()

      cy.contains('End to End testing with Cypress - Gonzalo Coradello')
      cy.contains(
        /New blog "End to End testing with Cypress" by Gonzalo Coradello created/i,
      )
    })

    describe('When there are blogs in the list', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'End to End testing with Cypress',
          author: 'Imaan Ibrar',
          url: 'http://localhost:3001/blogs/663f9a2c542e5f8e7029f260',
        })
        cy.createBlog({
          title: 'Differences between unit, integration and E2E testing',
          author: 'Ibrahim Ibrar',
          url: 'http://localhost:3001/blogs/66404e64225485fef89f1b2b',
        })
      })

      it('users can like a blog', function () {
        cy.contains(
          /End to End testing with Cypress - Imaan Ibrar/i,
        ).click()
        cy.get('button').contains(/like/i).click().wait(1000).click().wait(1000)
        cy.contains('51 likes') // increase two
      })

      it('the user who created the blog can delete it', function () {
        cy.contains(/Differences between unit, integration and E2E testing/i).as(
          'firstBlog',
        )
        cy.get('@firstBlog').click()
        cy.contains('remove').click()
        cy.on('window:confirm', () => true)
        //cy.get('@firstBlog').should('not.exist')
        cy.contains('Blog deleted')
      })

      it('blogs are ordered according to likes', function () {
        const firstBlogTitle = 'UI?UX - Dr. John Keats'
        const secondBlogTitle =
          'End to End testing with Cypress - Imaan Ibrar'

        cy.get('.blog').eq(0).should('contain', firstBlogTitle)
        cy.get('.blog').eq(1).should('contain', secondBlogTitle)

        cy.contains(secondBlogTitle).click()
        cy.get('button').contains(/like/i).click().wait(1000).click().wait(1000)

        cy.contains(/blogs/i).click()
        cy.get('.blog').eq(1).should('contain', secondBlogTitle).click()
        cy.contains(/53 likes/i) // increase two
        cy.contains(/blogs/i).click()
        cy.get('.blog').eq(0).should('contain', firstBlogTitle).click()
        cy.contains(/986 likes/i)
      })

      
    })
  })
})