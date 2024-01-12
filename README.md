# Road to create a sudoku site

This is a doc about the learning process of creating a sudoku website using vercel and next.js according to task specified in https://mp.weixin.qq.com/s/9Tl8TG8hnvlLfCkVmPzf-w The goal is to complete all of them, learning everything needed along the way.

I have some background knowledge of how to build a site but has never used react/next.js/vercel. 



# Step 0

search and forked https://github.com/YOOUMUU/next-sudoku-game as a base to learn and start

checkout to vscode

```less
npm install --save @types/react

npm install react@latest react-dom@latest next@latest
```



ask chatgpt about the project basics and a possible learning path 

## file structure

1. **.eslintrc.json**: This file contains the configuration for ESLint, a tool for identifying and reporting on patterns in JavaScript, helping you to maintain code quality.
2. **.gitignore**: Lists files and directories which should be ignored by Git, such as `node_modules` or build artifacts.
3. **app**: This directory likely contains the **main application logic**. In Next.js, you typically have pages, public, and API directories, but the structure can vary based on project needs.
4. **components**: A directory for React components. Components are reusable UI elements, and understanding them is key to working with React and Next.js.
5. **next.config.js**: Configuration file for Next.js, where you can customize various aspects of how your application behaves.
6. **package-lock.json** & **package.json**: These files manage project dependencies and scripts. `package.json` is like a manifest for your project, while `package-lock.json` ensures consistent installs across machines.
7. **postcss.config.js**: Configuration for PostCSS, a tool for transforming CSS with JavaScript, often used in conjunction with Tailwind CSS in Next.js projects.
8. **styles**: Contains CSS files. Next.js supports CSS Modules out of the box, which is a way to locally scope CSS.
9. **tailwind.config.ts**: Configuration file for Tailwind CSS, a utility-first CSS framework often used in modern web development.
10. **tsconfig.json**: Configuration file for TypeScript, a superset of JavaScript that adds static types.
11. **utils**: Commonly used for utility functions that can be shared across different parts of the application.

## Learning Path:

Given your background in Java, here’s a suggested path to learn and get hands-on with this project:

1. **Familiarize with JavaScript and React Basics**: Since React's component model might be different from Vue's, it's crucial to understand how React components, state, and props work.
2. **Explore Next.js Fundamentals**: Learn about Next.js features like server-side rendering, static site generation, and file-based routing.
3. **Understand the Project Structure**: Look into each directory and file you have in your project. **Start with the `components` directory** and see how the React components are structured.
4. **Read the Code**: Go through the code in the `app` directory to understand how the application is set up and how pages are rendered.
5. **Run the Project Locally**: Use `npm install` to install dependencies and `npm run dev` to start the development server. This will give you a feel for the application.
6. **Tinker and Experiment**: Modify existing components or create new ones. Try to add a new feature or tweak the UI.
7. **Learn Tailwind CSS**: If you’re not familiar with Tailwind CSS, it’s a good idea to understand how it’s being used in this project for styling.
8. **Explore TypeScript**: If TypeScript is new to you, it’s worth investing time to understand its benefits and how it’s used in this project.
9. **Reference Documentation**: Regularly refer to the official documentation of React, Next.js, and other technologies used in the project.

This approach will help you leverage your existing programming skills while adapting to the React and Next.js ecosystem. Remember, hands-on practice is key to understanding and mastering these technologies.



# Step 1 

## path

learn everything necessary, the learning path: react - nextjs- first demo - read sudokudemo 

https://nextjs.org/docs

https://react.dev/learn



## nextjs react foundation 

react foundation https://nextjs.org/learn/react-foundations

### JS foundation 

1. **函数和箭头函数 (Functions and Arrow Functions)**: 在React中，组件可以通过函数来定义。箭头函数因其简洁性在React组件和事件处理中广泛使用。例如，React组件可以简单地定义为 `const Component = () => Hello World;`。箭头函数还帮助处理`this`关键字的绑定问题。
2. **对象 (Objects)**: 对象在React中用于保存和处理状态（state）和属性（props）。例如，组件的状态可以是一个对象，如`this.state = { name: 'Alice' };`。属性（props）也是对象，用于将数据传递给子组件。
3. **数组和数组方法 (Arrays and Array Methods)**: 数组在React中常用于渲染列表或集合。例如，使用数组的`.map()`方法可以将数据数组转换为元素数组。在Next.js中，这对于动态路由和数据获取尤为重要。
4. **解构 (Destructuring)**: 在React中，解构常用于从props、state和context中提取值。例如，`const { name, age } = this.props`可以快速获取props中的name和age值。这使得代码更加清晰和简洁。
5. **模板字面量 (Template Literals)**: 模板字面量在React中常用于动态生成字符串，例如，动态设置类名或样式。在Next.js中，它们也常用于动态构建字符串，如文件路径或URL。
6. **三元运算符 (Ternary Operators)**: 在React中，三元运算符经常用于条件渲染。例如，`{isLoggedIn ?  : }` 可以根据用户的登录状态渲染不同的按钮。
7. **ES模块和导入/导出语法 (ES Modules and Import / Export Syntax)**: 在React和Next.js项目中，组件、函数、常量等通常被分散在不同的文件中，并通过导入（import）和导出（export）语句来共享。这种模块化方式有助于代码的组织和维护。
8. **Rest参数 (Rest Parameters)** 允许你将一个不确定数量的参数表示为一个数组。它通过在函数定义中的最后一个参数前加上三个点（`...`）来实现。



### react foundation



how-declarative-ui-compares-to-imperative https://react.dev/learn/reacting-to-input-with-state#how-declarative-ui-compares-to-imperative





### React core conceps

#### **Components**

 This modularity allows your code to be more maintainable as it grows because you can add, update, and delete components without touching the rest of our application. A component is a function that **returns UI elements**.

React components should be capitalized, use React components the same way you'd use regular HTML tags, with angle brackets `<>`

**in React, rendering logic and markup live together in the same place—components.** 



#### **Props**

you can pass pieces of information as **properties to React components**. These are called `props`. In React, data flows down the component tree. This is referred to as *one-way data flow*. 

Props are read-only information that's passed to components. 

State is information that can change over time, usually triggered by user interaction.



#### **State**

 React helps us add interactivity with **state** and **event handlers**.

React has a set of functions called **hooks**. Hooks allow you to add additional logic such as state to your components.

You can use *state* to store and increment the number of times a user has clicked the "Like" button. In fact, the React hook used to manage state is called: `useState()`.

```jsx
function HomePage() {
  // ...
  const [likes, setLikes] = React.useState(0);
}
```

- first item in the array is the state `value`, It's recommended to name it something descriptive
- The second item in the array is a function to `update` the value. it's common to prefix it with `set` followed by the name of the state variable you're updating
- You can also take the opportunity to add the initial value of your `likes` state to `0`

### JSX

JSX: Putting markup into JavaScript . JSX is a syntax extension for JavaScript that allows you to describe your UI in a familiar *HTML-like* syntax. 

- JSX is stricter and has a few more rules than HTML

- 3 Rules of JSX  https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx

- Use a JSX Converter https://transform.tools/html-to-jsx

-  use curly braces to weave in and out of "JavaScript" and "JSX" land.

  - ```jsx
    <ul>
        {names.map((name) => (
            <li key={name}>{name}</li>
         ))}
    </ul>
    ```

    

### React emaple so far



```react
<html>
  <body>
    <div id="app"></div>
 
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
 
    <script type="text/jsx">
      const app = document.getElementById("app")
 
      function Header({ title }) {
        return <h1>{title ? title : "Default title"}</h1>
      }
 
      function HomePage() {
        const names = ["Ada Lovelace", "Grace Hopper", "Margaret Hamilton"]
 
        const [likes, setLikes] = React.useState(0)
 
        function handleClick() {
          setLikes(likes + 1)
        }
 
        return (
          <div>
            <Header title="Develop. Preview. Ship." />
            <ul>
              {names.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
 
            <button onClick={handleClick}>Like ({likes})</button>
          </div>
        )
      }
 
      const root = ReactDOM.createRoot(app);
      root.render(<HomePage />);
    </script>
  </body>
</html>
```





```less
npm install react@latest react-dom@latest next@latest
```

after installing react, the code will look like below

```js
import { useState } from 'react';
 
function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}
 
function HomePage() {
  const names = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];
 
  const [likes, setLikes] = useState(0);
 
  function handleClick() {
    setLikes(likes + 1);
  }
 
  return (
    <div>
      <Header title="Develop. Preview. Ship." />
      <ul>
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
 
      <button onClick={handleClick}>Like ({likes})</button>
    </div>
  );
}
```





###  Server and Client Components 

The **client** refers to the browser on a user’s device that sends a request to a server for your application code. It then turns the response it receives from the server into an interface the user can interact with.
The **server** refers to the computer in a data center that stores your application code, receives requests from a client, does some computation, and sends back an appropriate response.



Certain operations (e.g. data fetching or managing user state) are better suited for one environment over the other.

 **Network Boundary** is a conceptual line that separates the different environments. In React, you choose where to place the network boundary in your component tree. For example, you can fetch data and render a user's posts on the server (using Server Components), then render the interactive `LikeButton` for each post on the client (using Client Components).



Behind the scenes, the components are split into two module graphs. The **server module graph (or tree)** contains all the Server Components that are rendered on the server, and the **client module graph (or tree)** contains all Client Components.

After Server Components are rendered, a special data format called the **React Server Component Payload (RSC)** is sent to the client. The RSC payload contains:

1. The rendered result of Server Components.
2. Placeholders (or holes) for where Client Components should be rendered and references to their JavaScript files.

React uses this information to consolidate the Server and Client Components and update the DOM on the client.



Next.js uses Server Components by default.

make the component a Client Component, add the React `'use client'` directive at the **top of the file**. This tells React to render the component on the client.



## dashboard app

https://nextjs.org/learn/dashboard-app



### Tailwind to style elements by adding class names

[Tailwind](https://tailwindcss.com/) is a CSS framework that speeds up the development process by allowing you to quickly write [utility classes](https://tailwindcss.com/docs/utility-first) directly in your TSX markup.

### breakpoint with hidden/block

**Tailwind's Responsive Design System**: Tailwind uses a mobile-first approach. It provides various breakpoints (like `sm`, `md`, `lg`, `xl`, `2xl`) that correspond to different minimum screen widths. These breakpoints are used with utility classes to apply styles conditionally based on the screen size.[Nested routing                 ](https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages#nested-routing)

**The `hidden` Class**: This is a utility class in Tailwind CSS that sets the `display` property of an element to `none`, effectively hiding it. When used alone, `hidden` will hide the element on all screen sizes.

**Combining `hidden` with Breakpoints**: When you combine `hidden` with a breakpoint, it changes the behavior based on the screen size. For example, `md:block` means that the element will use `display: block` (become visible) on medium (`md`) screens and larger, but will remain hidden on smaller screens.

**The `block` and `md:hidden` Classes**: The `block` class sets the `display` property to `block`, making the element visible. When combined with `md:hidden`, it means the element will be visible on small screens but will be hidden on medium screens and larger.



### cls library to toggle class names

[`clsx`](https://www.npmjs.com/package/clsx) is a library that lets you toggle class names easily. 

- Suppose that you want to create an `InvoiceStatus` component which accepts `status`. The status can be `'pending'` or `'paid'`.
- If it's `'paid'`, you want the color to be green. If it's `'pending'`, you want the color to be gray.

```less
import clsx from 'clsx';
 
export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-sm',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
    // ...
)}
```



### file-system routing & colocation

how you can create different pages in Next.js: create a new route segment using a folder, and add a `page` file inside it.

Next.js uses file-system routing where **folders** are used to create nested routes. Each folder represents a **route segment** that maps to a **URL segment**.`page.tsx` is a special Next.js file that exports a React component, and it's required for the route to be accessible.

By having a special name for `page` files, Next.js allows you to [colocate](https://nextjs.org/docs/app/building-your-application/routing#colocation) UI components, test files, and other related code with your routes. Only the content inside the `page` file will be publicly accessible.



# Step 2

add backend